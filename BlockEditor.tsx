
import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_BLOCKS, MAZE_LEVELS } from './constants';
import { Play, RotateCcw, Trash2, AlertTriangle, Trophy, Zap, ArrowRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight as ArrowRightIcon, Terminal } from 'lucide-react';
import { CartoonBat, CartoonOwl, CartoonParrot } from './BirdSkins';

interface Position {
  x: number;
  y: number;
}

const FruitTreeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-emerald-400">
    <path d="M11,21V18.11C8.71,17.7 7,15.65 7,13.2C7,11.23 8.13,9.5 9.77,8.61C9.3,7.66 9,6.5 9,5.3C9,2.43 11.24,0.11 14,0.11C16.76,0.11 19,2.43 19,5.3C19,6.5 18.7,7.66 18.23,8.61C19.87,9.5 21,11.23 21,13.2C21,15.65 19.29,17.7 17,18.11V21H11M13,6A1,1 0 0,0 12,7A1,1 0 0,0 13,8A1,1 0 0,0 14,7A1,1 0 0,0 13,6M16,10A1,1 0 0,0 15,11A1,1 0 0,0 16,12A1,1 0 0,0 17,11A1,1 0 0,0 16,10M13,13A1,1 0 0,0 12,14A1,1 0 0,0 13,15A1,1 0 0,0 14,14A1,1 0 0,0 13,13Z" />
    <circle cx="12" cy="7" r="1.5" className="text-red-500" fill="currentColor" />
    <circle cx="16" cy="11" r="1.5" className="text-red-500" fill="currentColor" />
    <circle cx="13" cy="14" r="1.5" className="text-red-500" fill="currentColor" />
  </svg>
);

const CoinIcon = () => (
  <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-spin-slow">
    <span className="text-yellow-800 font-black text-xs">$</span>
  </div>
);

const BlockIconRenderer: React.FC<{ action: string, size?: number }> = ({ action, size = 18 }) => {
  switch (action) {
    case 'MOVE_RIGHT': return <ArrowRightIcon size={size} />;
    case 'MOVE_LEFT': return <ArrowLeft size={size} />;
    case 'MOVE_UP': return <ArrowUp size={size} />;
    case 'MOVE_DOWN': return <ArrowDown size={size} />;
    default: return <Zap size={size} />;
  }
};

export const BlockEditor: React.FC<{ 
  levelId?: string; 
  activeSkin?: string;
  onWin?: () => void; 
  onNext?: () => void;
  onCollect?: (count: number) => void;
}> = ({ levelId = 'lvl1', activeSkin = 'bat', onWin, onNext, onCollect }) => {
  const level = MAZE_LEVELS.find(l => l.id === levelId) || MAZE_LEVELS[0];
  const [activeCode, setActiveCode] = useState<any[]>([]);
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'CELEBRATING' | 'WIN' | 'FAIL'>('IDLE');
  const [errorMsg, setErrorMsg] = useState("");
  const [collectedCoins, setCollectedCoins] = useState<Set<string>>(new Set());
  const [showCelebrationPopups, setShowCelebrationPopups] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(60);

  useEffect(() => {
    resetLevel();
  }, [levelId]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const cols = level.map[0].length;
        const rows = level.map.length;
        const availableW = width - 60;
        const availableH = height - 60;
        const size = Math.min(90, availableW / cols, availableH / rows);
        setCellSize(size);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [level.map]);

  const resetLevel = () => {
    for (let y = 0; y < level.map.length; y++) {
      for (let x = 0; x < level.map[y].length; x++) {
        if (level.map[y][x] === 2) {
          setPlayerPos({ x, y });
        }
      }
    }
    setGameState('IDLE');
    setExecutingIndex(null);
    setErrorMsg("");
    setCollectedCoins(new Set());
    setShowCelebrationPopups(false);
  };

  const addBlock = (block: any) => {
    if (gameState === 'RUNNING' || gameState === 'CELEBRATING') return;
    setActiveCode(prev => [...prev, { ...block, instanceId: Math.random() }]);
  };

  const removeBlock = (index: number) => {
    if (gameState === 'RUNNING' || gameState === 'CELEBRATING') return;
    setActiveCode(prev => prev.filter((_, i) => i !== index));
  };

  const runCode = async () => {
    setGameState('RUNNING');
    setErrorMsg("");
    let currentX = playerPos.x;
    let currentY = playerPos.y;
    let localCollected = new Set<string>();

    for (let i = 0; i < activeCode.length; i++) {
      setExecutingIndex(i);
      await new Promise(r => setTimeout(r, 600));
      const block = activeCode[i];
      let nextX = currentX;
      let nextY = currentY;
      if (block.action === 'MOVE_RIGHT') nextX++;
      if (block.action === 'MOVE_LEFT') nextX--;
      if (block.action === 'MOVE_UP') nextY--;
      if (block.action === 'MOVE_DOWN') nextY++;

      if (nextY < 0 || nextY >= level.map.length || nextX < 0 || nextX >= level.map[0].length || level.map[nextY][nextX] === 1) {
        setGameState('FAIL');
        setErrorMsg("Oops! You crashed into a tree!");
        return;
      }

      currentX = nextX;
      currentY = nextY;
      setPlayerPos({ x: currentX, y: currentY });

      if (level.map[currentY][currentX] === 4) {
        const coinKey = `${currentX}-${currentY}`;
        if (!localCollected.has(coinKey)) {
          localCollected.add(coinKey);
          setCollectedCoins(new Set(localCollected));
        }
      }

      if (level.map[currentY][currentX] === 3) {
        setGameState('CELEBRATING');
        setExecutingIndex(null);
        setShowCelebrationPopups(true);
        
        await new Promise(r => setTimeout(r, 2500));
        
        setGameState('WIN');
        if (onWin) onWin();
        if (onCollect) onCollect(localCollected.size);
        return;
      }
    }
    setGameState('FAIL');
    setErrorMsg("Mission incomplete!");
  };

  const batScaleFactor = 0.7;

  const renderActiveBird = (isEating: boolean) => {
    switch (activeSkin) {
      case 'owl': return <CartoonOwl isEating={isEating} />;
      case 'parrot': return <CartoonParrot isEating={isEating} />;
      default: return <CartoonBat isEating={isEating} />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-row w-full h-[650px] bg-[#0c111d] rounded-[2.5rem] border-[4px] border-[#1e293b] shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* SIDEBAR TOOLBOX */}
        <div className="w-[120px] flex flex-col items-center py-6 px-3 border-r border-[#1e293b] bg-[#0c111d] shrink-0">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 mb-6 text-center">BLOCKS</h4>
          
          <div className="flex flex-col gap-3 w-full">
            {AVAILABLE_BLOCKS.map(block => (
              <button 
                key={block.id} 
                onClick={() => addBlock(block)} 
                className="w-full h-[72px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-all group relative overflow-hidden active:scale-95"
              >
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <BlockIconRenderer action={block.action} size={22} />
                <span className="text-[9px] font-black uppercase tracking-tighter mt-1 leading-none">{block.label.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE */}
        <div className="w-[240px] flex flex-col py-6 px-4 border-r border-[#1e293b] bg-[#080c14] shrink-0">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Terminal size={14} className="text-slate-500" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">PROGRAM.EXE</h4>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-6 scrollbar-hide">
            <div className="min-h-full bg-black/20 rounded-[2rem] p-3 flex flex-col gap-2.5 border border-white/5">
              {activeCode.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-700 font-bold opacity-30 py-10 text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-4">
                    <Zap size={20} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest leading-tight">Add blocks<br/>here</span>
                </div>
              ) : (
                activeCode.map((block, i) => (
                  <div 
                    key={block.instanceId} 
                    className={`group p-3 rounded-xl border flex justify-between items-center transition-all duration-300 
                      ${executingIndex === i 
                        ? 'bg-indigo-500/20 border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.2)] scale-[1.02]' 
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${executingIndex === i ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                         <BlockIconRenderer action={block.action} size={16} />
                      </div>
                      <span className={`text-[11px] font-bold ${executingIndex === i ? 'text-indigo-100' : 'text-slate-300'}`}>
                        {block.label}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeBlock(i)} 
                      className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button 
              disabled={gameState === 'RUNNING' || gameState === 'CELEBRATING' || activeCode.length === 0} 
              onClick={runCode} 
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all text-sm tracking-[0.1em] shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
            >
              <Play size={18} fill="currentColor" /> EXECUTE
            </button>
            <button 
              onClick={() => { setActiveCode([]); resetLevel(); }} 
              className="w-full h-12 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-slate-300 rounded-2xl flex items-center justify-center border border-slate-800 transition-all active:scale-[0.98]"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* STAGE */}
        <div ref={containerRef} className="flex-1 relative bg-[#020617] p-8 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_#1e293b_1px,_transparent_1px)] bg-[size:40px_40px]" />
          
          <div className="relative p-6 border-[12px] border-[#1e293b] rounded-[4rem] bg-[#0c111d] shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_40px_100px_rgba(0,0,0,0.6)]">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${level.map[0].length}, ${cellSize}px)`, gridTemplateRows: `repeat(${level.map.length}, ${cellSize}px)` }}>
              {level.map.flatMap((row, y) => row.map((tile, x) => (
                  <div key={`${x}-${y}`} className={`rounded-2xl flex items-center justify-center border transition-all duration-300 ${tile === 1 ? 'bg-emerald-950/10 border-emerald-900/10' : 'bg-white/5 border-white/[0.03] shadow-inner'}`} style={{ width: cellSize, height: cellSize }}>
                    {tile === 3 && <div className="scale-110 animate-pulse"><FruitTreeIcon /></div>}
                    {tile === 1 && <span className="text-xl opacity-20 grayscale filter blur-[1px]">🌲</span>}
                    {tile === 4 && !collectedCoins.has(`${x}-${y}`) && <CoinIcon />}
                  </div>
                ))
              )}
            </div>
            
            {showCelebrationPopups && (
              <>
                <div className="absolute pointer-events-none z-40" style={{ left: playerPos.x * (cellSize + 6) + 24, top: playerPos.y * (cellSize + 6) - 10 }}>
                   <div className="animate-celebration-popup text-yellow-400 font-bold text-xl drop-shadow-lg">+100 XP</div>
                </div>
                {collectedCoins.size > 0 && (
                   <div className="absolute pointer-events-none z-40" style={{ left: playerPos.x * (cellSize + 6) + 60, top: playerPos.y * (cellSize + 6) + 10 }}>
                     <div className="animate-celebration-popup text-emerald-400 font-bold text-xl drop-shadow-lg" style={{ animationDelay: '0.2s' }}>+{collectedCoins.size} COINS</div>
                   </div>
                )}
              </>
            )}

            <div className="absolute transition-all duration-500 ease-in-out z-10" style={{ left: playerPos.x * (cellSize + 6) + 24 + (cellSize - (cellSize * batScaleFactor)) / 2, top: playerPos.y * (cellSize + 6) + 24 + (cellSize - (cellSize * batScaleFactor)) / 2, width: cellSize * batScaleFactor, height: cellSize * batScaleFactor, transform: gameState === 'WIN' || gameState === 'CELEBRATING' ? 'rotate(15deg) scale(1.2)' : 'none' }}>
              <div className={`w-full h-full flex items-center justify-center ${gameState === 'FAIL' ? 'animate-shake' : 'animate-float-flight'}`}>
                {renderActiveBird(gameState === 'WIN' || gameState === 'CELEBRATING')}
              </div>
            </div>

            {gameState === 'WIN' && (
              <div className="absolute inset-0 bg-[#0c111df0] backdrop-blur-xl flex flex-col items-center justify-center text-white z-20 rounded-[3.5rem] animate-in fade-in zoom-in p-10">
                <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-indigo-500/40 animate-bounce">
                  <Trophy size={64} className="text-white" />
                </div>
                <h3 className="text-5xl font-heading mb-4 text-center tracking-tight">MISSION COMPLETED</h3>
                <p className="text-slate-400 font-semibold mb-12 uppercase tracking-[0.3em] text-xs">Access Granted to Next Sector</p>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button onClick={onNext} className="bg-white text-black font-black px-10 py-5 rounded-2xl text-xl flex items-center justify-center gap-4 hover:-translate-y-1 transition-all shadow-2xl group">
                    PROCEED <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button onClick={resetLevel} className="text-slate-500 font-bold hover:text-white transition-colors py-2 text-xs uppercase tracking-widest">Re-run Simulation</button>
                </div>
              </div>
            )}
            
            {gameState === 'FAIL' && (
              <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-white z-20 rounded-[3.5rem] animate-in fade-in zoom-in p-10 text-center">
                <div className="w-24 h-24 bg-rose-500/20 border border-rose-500/30 rounded-3xl flex items-center justify-center mb-8"><AlertTriangle size={48} className="text-rose-500" /></div>
                <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">SIMULATION FAILED</h3>
                <p className="mb-10 font-bold text-rose-200 text-lg opacity-80">{errorMsg}</p>
                <button onClick={resetLevel} className="bg-white text-rose-950 font-black px-16 py-5 rounded-2xl text-xl hover:scale-105 transition-all shadow-2xl">RE-TRY</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes float-flight { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-float-flight { animation: float-flight 2.5s ease-in-out infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        .animate-shake { animation: shake 0.1s ease-in-out infinite; animation-iteration-count: 4; }
        @keyframes celebration-popup {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { transform: translateY(-20px) scale(1.1); opacity: 1; }
          80% { transform: translateY(-40px) scale(1); opacity: 1; }
          100% { transform: translateY(-60px) scale(0.8); opacity: 0; }
        }
        .animate-celebration-popup {
          animation: celebration-popup 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
