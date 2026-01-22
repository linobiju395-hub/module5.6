
import React, { useState, useEffect, useRef } from 'react';
import { SPACE_BLOCKS } from '../constants';
import { Play, RotateCcw, Trash2, Trophy, Zap, Star, AlertCircle, Radio, Drill, ChevronRight, Loader2, Target } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const SpaceMinerGame: React.FC<{
  activeSkin?: string;
  onWin?: () => void;
  onCollect?: (count: number) => void;
}> = ({ onWin, onCollect }) => {
  const [activeCode, setActiveCode] = useState<any[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'WIN' | 'FAIL'>('IDLE');
  const [dronePos, setDronePos] = useState<Point>({ x: 0, y: 0 });
  const [droneDir, setDroneDir] = useState<number>(0); // 0: Right, 1: Down, 2: Left, 3: Up
  const [energy, setEnergy] = useState(100);
  const [gemsCollected, setGemsCollected] = useState(0);
  const [executingIdx, setExecutingIdx] = useState<number | null>(null);
  const [grid, setGrid] = useState<number[][]>([]); // 0: empty, 1: asteroid, 2: gem
  const [isScanning, setIsScanning] = useState(false);

  const isRunningRef = useRef(false);

  useEffect(() => {
    initGrid();
  }, []);

  const initGrid = () => {
    const newGrid = Array(6).fill(0).map(() => Array(6).fill(0));
    let gemsPlaced = 0;
    while(gemsPlaced < 4) {
      let x = Math.floor(Math.random() * 6);
      let y = Math.floor(Math.random() * 6);
      if ((x === 0 && y === 0) || newGrid[y][x] !== 0) continue;
      newGrid[y][x] = 2; // Gem
      gemsPlaced++;
    }

    let obstaclesPlaced = 0;
    while(obstaclesPlaced < 5) {
      let x = Math.floor(Math.random() * 6);
      let y = Math.floor(Math.random() * 6);
      if ((x === 0 && y === 0) || newGrid[y][x] !== 0) continue;
      newGrid[y][x] = 1; // Asteroid
      obstaclesPlaced++;
    }

    setGrid(newGrid);
    setDronePos({ x: 0, y: 0 });
    setDroneDir(0);
    setEnergy(100);
    setGemsCollected(0);
    setGameState('IDLE');
    setExecutingIdx(null);
    isRunningRef.current = false;
  };

  const addBlock = (block: any) => {
    if (gameState === 'RUNNING') return;
    setActiveCode(prev => [...prev, { ...block, instanceId: Math.random() }]);
  };

  const removeBlock = (index: number) => {
    if (gameState === 'RUNNING') return;
    setActiveCode(prev => prev.filter((_, i) => i !== index));
  };

  const runCode = async () => {
    if (activeCode.length === 0 || gameState === 'RUNNING') return;
    setGameState('RUNNING');
    isRunningRef.current = true;
    
    let currentX = dronePos.x;
    let currentY = dronePos.y;
    let currentDir = droneDir;
    let currentEnergy = energy;
    let currentGems = gemsCollected;

    for (let i = 0; i < activeCode.length; i++) {
      if (!isRunningRef.current) break;
      setExecutingIdx(i);
      const block = activeCode[i];
      
      await new Promise(r => setTimeout(r, 800));

      if (block.action === 'STEP') {
        let nextX = currentX;
        let nextY = currentY;
        if (currentDir === 0) nextX++;
        if (currentDir === 1) nextY++;
        if (currentDir === 2) nextX--;
        if (currentDir === 3) nextY--;

        if (nextX < 0 || nextX >= 6 || nextY < 0 || nextY >= 6 || grid[nextY][nextX] === 1) {
          setGameState('FAIL');
          isRunningRef.current = false;
          return;
        }
        currentX = nextX;
        currentY = nextY;
        currentEnergy -= 8;
      } else if (block.action === 'TURN_R') {
        currentDir = (currentDir + 1) % 4;
        currentEnergy -= 3;
      } else if (block.action === 'SCAN') {
        setIsScanning(true);
        await new Promise(r => setTimeout(r, 600));
        setIsScanning(false);
        currentEnergy -= 5;
      } else if (block.action === 'COLLECT') {
        if (grid[currentY][currentX] === 2) {
          const newGrid = [...grid];
          newGrid[currentY][currentX] = 0;
          setGrid(newGrid);
          currentGems++;
          currentEnergy += 10;
        }
        currentEnergy -= 5;
      }

      setDronePos({ x: currentX, y: currentY });
      setDroneDir(currentDir);
      setEnergy(Math.max(0, currentEnergy));
      setGemsCollected(currentGems);

      if (currentEnergy <= 0) {
        setGameState('FAIL');
        isRunningRef.current = false;
        return;
      }

      if (currentGems >= 3) {
        setGameState('WIN');
        isRunningRef.current = false;
        if (onWin) onWin();
        if (onCollect) onCollect(50);
        return;
      }
    }

    if (currentGems < 3) {
      setGameState('FAIL');
    }
    isRunningRef.current = false;
  };

  const renderActiveCharacter = () => {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Blinking Outer Pulse */}
        <div className="absolute w-full h-full bg-red-500 rounded-full animate-dot-pulse opacity-40" />
        {/* Solid Blinking Core */}
        <div className="w-1/2 h-1/2 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-dot-blink border-2 border-red-400" />
        {/* Techy Direction Arrow */}
        <div 
          className="absolute -top-1 w-2 h-4 bg-red-400 rounded-full shadow-lg" 
          style={{ transform: `rotate(${droneDir * 90}deg)`, transformOrigin: 'center 20px' }}
        />
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 bg-[#020617] p-6 lg:p-8 rounded-[3rem] border-4 border-[#1e293b] select-none">
      
      {/* TOOLBOX */}
      <div className="w-full lg:w-[130px] flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
        <h4 className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 text-center">Spells</h4>
        {SPACE_BLOCKS.map(block => (
          <button 
            key={block.id} 
            onClick={() => addBlock(block)}
            disabled={gameState === 'RUNNING'}
            className="shrink-0 w-16 h-16 lg:w-full aspect-square bg-indigo-600 rounded-2xl flex flex-col items-center justify-center text-white border-b-6 border-indigo-900 active:translate-y-1 active:border-b-0 disabled:opacity-30 transition-all shadow-lg"
          >
            <span className="text-2xl">{block.icon}</span>
            <span className="text-[8px] font-black uppercase mt-1 leading-tight text-center px-1">{block.label}</span>
          </button>
        ))}
      </div>

      {/* WORKSPACE */}
      <div className="w-full lg:w-[240px] flex flex-col bg-[#0c111d] p-6 rounded-[2rem] border-2 border-[#1e293b]">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mission Code</h4>
          <div className={`h-2 w-2 rounded-full ${gameState === 'RUNNING' ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'}`} />
        </div>
        
        <div className="flex-1 min-h-[300px] border-2 border-dashed border-slate-800/50 rounded-3xl p-4 flex flex-col gap-3 overflow-y-auto mb-6 scrollbar-hide">
          {activeCode.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
              <Target size={32} className="mb-2 text-indigo-400" />
              <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">Sequence blocks<br/>to find crystals</p>
            </div>
          ) : (
            activeCode.map((block, i) => (
              <div key={block.instanceId} className={`p-3 rounded-xl flex items-center justify-between text-white font-black text-xs transition-all ${executingIdx === i ? 'bg-orange-500 scale-105 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'bg-indigo-500/80 border-l-4 border-indigo-400'}`}>
                <span className="flex items-center gap-2"><span>{block.icon}</span> {block.label}</span>
                <button onClick={() => removeBlock(i)} disabled={gameState === 'RUNNING'} className="text-white/40 hover:text-white p-1"><Trash2 size={12} /></button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3">
          <button 
            onClick={runCode} 
            disabled={gameState === 'RUNNING' || activeCode.length === 0} 
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl border-b-8 border-emerald-950 flex items-center justify-center gap-3 active:translate-y-1 active:border-b-0 disabled:opacity-20 transition-all text-xl shadow-2xl"
          >
             <Play size={24} fill="currentColor" /> INITIATE
          </button>
          <button onClick={initGrid} className="w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-slate-700"><RotateCcw size={16} /> RESET MAP</button>
        </div>
      </div>

      {/* GAME STAGE */}
      <div className="flex-1 bg-[#090e1a] rounded-[2.5rem] relative overflow-hidden p-6 lg:p-10 flex flex-col items-center justify-center border-2 border-[#1e293b] shadow-inner">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full" style={{ 
              width: Math.random() * 2, height: Math.random() * 2, 
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s infinite`
            }} />
          ))}
        </div>

        {/* HUD */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30 pointer-events-none">
           <div className="bg-black/60 backdrop-blur-md px-5 py-4 rounded-3xl border border-white/10 flex items-center gap-4 pointer-events-auto shadow-2xl">
              <Zap className={`text-yellow-400 ${energy < 30 ? 'animate-pulse' : ''}`} size={24} fill="currentColor" />
              <div className="w-24 lg:w-32 h-4 bg-slate-900 rounded-full overflow-hidden p-1 border border-white/5">
                 <div className={`h-full rounded-full transition-all duration-500 ${energy > 50 ? 'bg-emerald-500' : energy > 20 ? 'bg-yellow-500' : 'bg-rose-500'}`} style={{ width: `${energy}%` }} />
              </div>
           </div>
           <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4 pointer-events-auto shadow-2xl">
              <Star className="text-indigo-400" size={24} fill="currentColor" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Crystals</span>
                <span className="text-white font-heading text-xl leading-none">{gemsCollected} / 3</span>
              </div>
           </div>
        </div>

        {/* Grid */}
        <div className="relative bg-[#0c111d]/50 p-2 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="grid grid-cols-6 grid-rows-6 gap-1 lg:gap-2 relative">
            {grid.map((row, y) => row.map((tile, x) => (
              <div key={`${x}-${y}`} className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-indigo-950/20 border border-white/5 flex items-center justify-center relative overflow-hidden">
                 {tile === 1 && (
                   <div className="animate-float-slow">
                     <div className="absolute inset-0 bg-slate-400 blur-xl opacity-10" />
                     <AlertCircle className="text-slate-700 opacity-60" size={32} />
                   </div>
                 )}
                 {tile === 2 && (
                   <div className="relative group">
                     <div className="absolute inset-0 bg-indigo-400 blur-2xl opacity-40 animate-pulse scale-150" />
                     <Star className="text-indigo-400 drop-shadow-[0_0_12px_rgba(129,140,248,0.9)] animate-bounce" size={32} fill="currentColor" />
                   </div>
                 )}
              </div>
            )))}

            {/* THE RED BLINKING CHARACTER */}
            <div 
              className="absolute transition-all duration-700 ease-in-out z-40"
              style={{ 
                left: `${dronePos.x * (100/6)}%`, 
                top: `${dronePos.y * (100/6)}%`, 
                width: `${100/6}%`, 
                height: `${100/6}%`,
                padding: '10%'
              }}
            >
               {renderActiveCharacter()}
            </div>
          </div>
        </div>

        {/* OVERLAYS */}
        {gameState === 'WIN' && (
           <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center text-white animate-in zoom-in p-10 text-center">
              <Trophy size={120} className="text-yellow-400 mb-8 drop-shadow-[0_0_40px_rgba(250,204,21,0.6)] animate-bounce" />
              <h3 className="text-5xl font-heading mb-4">MINING LEGEND!</h3>
              <p className="text-indigo-200 mb-10 font-bold text-lg max-w-sm">Mission Accomplished! You successfully explored the asteroid belt.</p>
              <button onClick={initGrid} className="bg-white text-indigo-950 font-black px-16 py-6 rounded-[2rem] text-2xl shadow-2xl border-b-8 border-slate-300 transition-all hover:scale-105 active:translate-y-2">NEXT ASTEROID</button>
           </div>
        )}

        {gameState === 'FAIL' && (
           <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center text-white animate-in zoom-in text-center p-10">
              <div className="bg-rose-500/20 p-8 rounded-full mb-8">
                <AlertCircle size={80} className="text-rose-400 animate-pulse" />
              </div>
              <h3 className="text-4xl font-heading mb-4 uppercase tracking-tighter">LOST IN SPACE</h3>
              <p className="text-rose-200 mb-10 font-bold text-lg max-w-xs">Mission failed! Adjust your code and try again.</p>
              <button onClick={initGrid} className="bg-white text-rose-950 font-black px-12 py-5 rounded-2xl text-xl border-b-8 border-slate-300 transition-all hover:scale-105 active:translate-y-2">RE-CALIBRATE</button>
           </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes dot-pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes dot-blink {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.6; filter: brightness(1.5); }
        }
        .animate-dot-pulse { animation: dot-pulse 1.2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-dot-blink { animation: dot-blink 0.6s ease-in-out infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
