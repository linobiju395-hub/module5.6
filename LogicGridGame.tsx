
import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_BLOCKS } from './constants';
// Added AlertCircle to the imports from lucide-react
import { Play, RotateCcw, Trash2, Trophy, Zap, Star, Map, Shield, ChevronRight, Loader2, Key, AlertCircle } from 'lucide-react';
import { CartoonBat, CartoonOwl, CartoonParrot } from './BirdSkins';

interface Point { x: number; y: number; }

export const LogicGridGame: React.FC<{
  activeSkin?: string;
  onWin?: () => void;
  onCollect?: (count: number) => void;
}> = ({ activeSkin = 'bat', onWin, onCollect }) => {
  const [activeCode, setActiveCode] = useState<any[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'WIN' | 'FAIL'>('IDLE');
  const [playerPos, setPlayerPos] = useState<Point>({ x: 0, y: 7 });
  const [playerDir, setPlayerDir] = useState(0); // 0: Up, 1: Right, 2: Down, 3: Left
  const [energy, setEnergy] = useState(100);
  const [crystals, setCrystals] = useState(0);
  const [executingIdx, setExecutingIdx] = useState<number | null>(null);
  const [grid, setGrid] = useState<number[][]>([]); // 0: path, 1: wall, 2: switch, 3: gate, 4: crystal, 5: exit
  const [gateOpen, setGateOpen] = useState(false);

  const isRunningRef = useRef(false);

  useEffect(() => {
    initLevel();
  }, []);

  const initLevel = () => {
    const newGrid = Array(8).fill(0).map(() => Array(8).fill(1));
    // Simple S-shaped path
    const path = [
      {x:0,y:7},{x:1,y:7},{x:2,y:7},{x:2,y:6},{x:2,y:5},{x:3,y:5},{x:4,y:5},
      {x:4,y:4},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3},{x:7,y:2},{x:7,y:1},{x:7,y:0}
    ];
    path.forEach(p => newGrid[p.y][p.x] = 0);
    
    newGrid[5][3] = 2; // Switch
    newGrid[3][7] = 3; // Gate
    newGrid[7][1] = 4; // Crystal
    newGrid[5][4] = 4; // Crystal
    newGrid[1][7] = 4; // Crystal
    newGrid[0][7] = 5; // Exit

    setGrid(newGrid);
    setPlayerPos({ x: 0, y: 7 });
    setPlayerDir(1);
    setEnergy(100);
    setCrystals(0);
    setGateOpen(false);
    setGameState('IDLE');
    setExecutingIdx(null);
    isRunningRef.current = false;
  };

  const addBlock = (block: any) => {
    if (gameState === 'RUNNING') return;
    setActiveCode(prev => [...prev, { ...block, instanceId: Math.random() }]);
  };

  const removeBlock = (i: number) => {
    if (gameState === 'RUNNING') return;
    setActiveCode(prev => prev.filter((_, idx) => idx !== i));
  };

  const runCode = async () => {
    if (activeCode.length === 0 || gameState === 'RUNNING') return;
    setGameState('RUNNING');
    isRunningRef.current = true;

    let curX = 0, curY = 7, curDir = 1, curEnergy = 100, curCrystals = 0, curGateOpen = false;

    const executeCommand = async (block: any) => {
      if (!isRunningRef.current) return;
      await new Promise(r => setTimeout(r, 400));

      if (block.action === 'STEP') {
        let nx = curX, ny = curY;
        if (curDir === 0) ny--;
        if (curDir === 1) nx++;
        if (curDir === 2) ny++;
        if (curDir === 3) nx--;

        if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8 || grid[ny][nx] === 1 || (grid[ny][nx] === 3 && !curGateOpen)) {
          isRunningRef.current = false;
          setGameState('FAIL');
          return;
        }
        curX = nx; curY = ny;
        curEnergy -= 4;
      } else if (block.action === 'TURN_R') {
        curDir = (curDir + 1) % 4;
        curEnergy -= 2;
      } else if (block.action === 'TURN_L') {
        curDir = (curDir + 3) % 4;
        curEnergy -= 2;
      } else if (block.action === 'IF_SWITCH') {
        if (grid[curY][curX] === 2) curGateOpen = true;
        curEnergy -= 5;
      } else if (block.action === 'COLLECT') {
        if (grid[curY][curX] === 4) {
          const ng = [...grid]; ng[curY][curX] = 0; setGrid(ng);
          curCrystals++;
        }
        curEnergy -= 5;
      }

      setPlayerPos({ x: curX, y: curY });
      setPlayerDir(curDir);
      setEnergy(Math.max(0, curEnergy));
      setCrystals(curCrystals);
      setGateOpen(curGateOpen);

      if (curEnergy <= 0) { isRunningRef.current = false; setGameState('FAIL'); }
      if (grid[curY][curX] === 5 && curCrystals >= 3) { isRunningRef.current = false; setGameState('WIN'); if(onWin)onWin(); if(onCollect)onCollect(100); }
    };

    for (let i = 0; i < activeCode.length; i++) {
      if (!isRunningRef.current) break;
      setExecutingIdx(i);
      const block = activeCode[i];

      if (block.action === 'REPEAT_2' || block.action === 'REPEAT_4') {
        const count = block.action === 'REPEAT_2' ? 2 : 4;
        const nextBlock = activeCode[i+1];
        if (nextBlock) {
          for (let r = 0; r < count; r++) {
            await executeCommand(nextBlock);
            if (!isRunningRef.current) break;
          }
          i++; // Skip the block we just repeated
        }
      } else {
        await executeCommand(block);
      }
    }

    if (isRunningRef.current && (grid[curY][curX] !== 5 || curCrystals < 3)) setGameState('FAIL');
    isRunningRef.current = false;
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 bg-[#061c16] p-8 rounded-[3rem] border-4 border-[#14532d] shadow-2xl">
      {/* TOOLBOX */}
      <div className="w-full lg:w-[130px] flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
        <h4 className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 text-center">Spells</h4>
        {AVAILABLE_BLOCKS.map(block => (
          <button key={block.id} onClick={() => addBlock(block)} disabled={gameState === 'RUNNING'} className="shrink-0 w-16 h-16 lg:w-full aspect-square bg-emerald-700 rounded-2xl flex flex-col items-center justify-center text-white border-b-6 border-emerald-950 active:translate-y-1 active:border-b-0 disabled:opacity-30 transition-all shadow-lg hover:bg-emerald-600">
            <span className="text-2xl">{block.icon}</span>
            <span className="text-[8px] font-black uppercase mt-1 text-center px-1">{block.label}</span>
          </button>
        ))}
      </div>

      {/* WORKSPACE */}
      <div className="w-full lg:w-[240px] flex flex-col bg-[#022c22] p-6 rounded-[2rem] border-2 border-[#14532d]">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6">Sequence</h4>
        <div className="flex-1 min-h-[300px] border-2 border-dashed border-emerald-900/50 rounded-3xl p-4 flex flex-col gap-3 overflow-y-auto mb-6 scrollbar-hide">
          {activeCode.map((block, i) => (
            <div key={block.instanceId} className={`p-3 rounded-xl flex items-center justify-between text-white font-black text-xs transition-all ${executingIdx === i ? 'bg-orange-500 scale-105 shadow-xl' : 'bg-emerald-600 border-l-4 border-emerald-400'}`}>
              <span className="flex items-center gap-2"><span>{block.icon}</span> {block.label}</span>
              <button onClick={() => removeBlock(i)} disabled={gameState === 'RUNNING'} className="text-white/40 hover:text-white"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
        <button onClick={runCode} disabled={gameState === 'RUNNING' || activeCode.length === 0} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl border-b-8 border-orange-900 flex items-center justify-center gap-3 active:translate-y-1 active:border-b-0 disabled:opacity-20 transition-all text-xl">
           <Play size={24} fill="currentColor" /> RUN CODE
        </button>
      </div>

      {/* STAGE */}
      <div className="flex-1 bg-[#022c22] rounded-[2.5rem] relative overflow-hidden p-6 flex flex-col items-center justify-center border-2 border-[#14532d]">
        <div className="absolute top-6 left-6 right-6 flex justify-between z-10 pointer-events-none">
           <div className="bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/5 flex items-center gap-4">
              <Zap className="text-yellow-400" size={24} fill="currentColor" />
              <div className="w-24 h-4 bg-emerald-950 rounded-full overflow-hidden p-1 border border-white/10">
                 <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${energy}%` }} />
              </div>
           </div>
           <div className="bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/5 flex items-center gap-4">
              <Star className="text-emerald-400" size={24} fill="currentColor" />
              <span className="text-white font-heading text-xl">{crystals} / 3</span>
           </div>
        </div>

        <div className="grid grid-cols-8 grid-rows-8 gap-1 bg-emerald-950/50 p-2 rounded-2xl shadow-2xl">
          {grid.map((row, y) => row.map((tile, x) => (
            <div key={`${x}-${y}`} className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center relative overflow-hidden transition-all border border-white/5">
               {tile === 1 ? <div className="w-full h-full bg-[#14532d]" /> : <div className="w-full h-full bg-[#064e3b] opacity-40" />}
               {tile === 2 && <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_blue]" />}
               {tile === 3 && <Shield className={`${gateOpen ? 'opacity-10' : 'opacity-100'} text-orange-400`} size={24} />}
               {tile === 4 && <Star className="text-yellow-400 animate-bounce" size={20} fill="currentColor" />}
               {tile === 5 && <div className="w-full h-full border-4 border-emerald-400 animate-pulse flex items-center justify-center"><ChevronRight className="text-emerald-400" /></div>}
               
               {playerPos.x === x && playerPos.y === y && (
                 <div className="absolute inset-0 z-20 flex items-center justify-center transition-transform duration-300" style={{ transform: `rotate(${(playerDir-1)*90}deg)` }}>
                   <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-emerald-500">
                     {activeSkin === 'owl' ? <CartoonOwl isEating={false} /> : activeSkin === 'parrot' ? <CartoonParrot isEating={false} /> : <CartoonBat isEating={false} />}
                   </div>
                 </div>
               )}
            </div>
          )))}
        </div>

        {gameState === 'WIN' && (
          <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center text-white p-10 text-center animate-in zoom-in">
            <Trophy size={100} className="text-yellow-400 mb-6 animate-bounce" />
            <h3 className="text-4xl font-heading mb-4">RUINS EXPLORED!</h3>
            <p className="text-emerald-200 mb-8 font-bold">You used loops and logic to bypass the ancient security systems!</p>
            <button onClick={initLevel} className="bg-white text-emerald-950 font-black px-12 py-5 rounded-2xl text-xl">PLAY AGAIN</button>
          </div>
        )}

        {gameState === 'FAIL' && (
          <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center text-white p-10 text-center animate-in zoom-in">
            <AlertCircle size={80} className="text-rose-400 mb-6" />
            <h3 className="text-3xl font-heading mb-4 uppercase tracking-tighter">TRAP TRIGGERED</h3>
            <p className="text-rose-200 mb-8 font-bold">You hit a wall, a locked gate, or ran out of energy. Use REPEAT and IF to survive!</p>
            <button onClick={initLevel} className="bg-white text-rose-950 font-black px-12 py-5 rounded-2xl text-xl">TRY AGAIN</button>
          </div>
        )}
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};
