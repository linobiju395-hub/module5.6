
import React, { useState, useEffect, useRef } from 'react';
import { VARIABLE_BLOCKS } from './constants';
import { Play, RotateCcw, Trash2, Trophy, Zap, MousePointer2, Sparkles, ArrowLeft, ArrowRight, Hash, Plus, Terminal, Cpu } from 'lucide-react';
import { CartoonBat, CartoonOwl, CartoonParrot } from './BirdSkins';

interface Fruit {
  id: number;
  x: number;
  y: number;
  type: 'apple' | 'cherry' | 'banana';
}

const BlockIconRenderer: React.FC<{ action: string, size?: number }> = ({ action, size = 18 }) => {
  switch (action) {
    case 'SET_SCORE_0': return <Hash size={size} />;
    case 'INC_SCORE': return <Plus size={size} />;
    case 'GO_LEFT': return <ArrowLeft size={size} />;
    case 'GO_RIGHT': return <ArrowRight size={size} />;
    default: return <Zap size={size} />;
  }
};

export const CollectAndScoreGame: React.FC<{
  activeSkin?: string;
  onWin?: () => void;
  onCollect?: (count: number) => void;
}> = ({ activeSkin = 'bat', onWin, onCollect }) => {
  const [activeCode, setActiveCode] = useState<any[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'WIN' | 'FAIL'>('IDLE');
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [executingIdx, setExecutingIdx] = useState<number | null>(null);
  
  const isRunningRef = useRef(false);
  const requestRef = useRef<number>(null);
  const scoreRef = useRef(0);
  const playerXRef = useRef(50);

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const resetGame = () => {
    isRunningRef.current = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setGameState('IDLE');
    setScore(0);
    scoreRef.current = 0;
    setPlayerX(50);
    playerXRef.current = 50;
    setFruits([]);
    setExecutingIdx(null);
  };

  const addBlock = (block: any) => {
    if (gameState === 'RUNNING') return;
    setActiveCode(prev => [...prev, { ...block, instanceId: Math.random() }]);
  };

  const removeBlock = (index: number) => {
    if (gameState === 'RUNNING') return;
    setActiveCode(prev => prev.filter((_, i) => i !== index));
  };

  const spawnFruit = () => {
    const newFruit: Fruit = {
      id: Date.now(),
      x: 10 + Math.random() * 80,
      y: -10,
      type: ['apple', 'cherry', 'banana'][Math.floor(Math.random() * 3)] as any
    };
    setFruits(prev => [...prev, newFruit]);
  };

  const runCode = () => {
    if (activeCode.length === 0) return;
    
    const hasScoreLogic = activeCode.some(b => b.action === 'INC_SCORE');
    
    setGameState('RUNNING');
    isRunningRef.current = true;
    let frame = 0;

    const gameLoop = () => {
      if (!isRunningRef.current) return;
      frame++;

      if (frame % 60 === 0) spawnFruit();

      activeCode.forEach(block => {
        if (block.action === 'GO_LEFT') playerXRef.current = Math.max(10, playerXRef.current - 0.8);
        if (block.action === 'GO_RIGHT') playerXRef.current = Math.min(90, playerXRef.current + 0.8);
      });

      setPlayerX(playerXRef.current);

      setFruits(prev => {
        const next = prev.map(f => ({ ...f, y: f.y + 0.8 })).filter(f => f.y < 110);
        
        next.forEach((f, idx) => {
          if (f.y > 80 && f.y < 95 && Math.abs(f.x - playerXRef.current) < 10) {
            if (hasScoreLogic) {
              scoreRef.current += 1;
              setScore(scoreRef.current);
            }
            f.y = 200; 
          }
        });

        return next.filter(f => f.y < 110);
      });

      if (scoreRef.current >= 10) {
        isRunningRef.current = false;
        setGameState('WIN');
        if (onWin) onWin();
        if (onCollect) onCollect(50);
      }

      if (isRunningRef.current) requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 bg-[#0c111d] p-6 lg:p-8 rounded-[3.5rem] border-4 border-[#1e293b] shadow-2xl overflow-hidden">
      
      {/* PROFESSIONAL TOOLBOX */}
      <div className="w-full lg:w-[130px] flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide shrink-0">
        <h4 className="hidden lg:block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 mb-6 text-center">OBJECTS</h4>
        {VARIABLE_BLOCKS.map(block => (
          <button 
            key={block.id} 
            onClick={() => addBlock(block)} 
            disabled={gameState === 'RUNNING'}
            className="shrink-0 w-24 h-24 lg:w-full h-[80px] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:border-indigo-500 hover:text-white transition-all group disabled:opacity-30 p-2 relative active:scale-95"
          >
            <div className={`mb-1 p-2 rounded-xl transition-colors ${block.type === 'variable' ? 'group-hover:bg-orange-500/10' : 'group-hover:bg-indigo-500/10'}`}>
              <BlockIconRenderer action={block.action} size={24} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest leading-none text-center">{block.label.split(' ').slice(-1)}</span>
          </button>
        ))}
      </div>

      {/* WORKSPACE - PRO CODE LOOK */}
      <div className="w-full lg:w-[280px] flex flex-col bg-[#080c14] p-6 rounded-[2.5rem] border border-[#1e293b]">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Cpu size={14} className="text-slate-500" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">LOGIC.SYS</h4>
        </div>

        <div className="flex-1 min-h-[300px] bg-black/30 border border-white/5 rounded-3xl p-4 flex flex-col gap-3 overflow-y-auto mb-6 scrollbar-hide">
          {activeCode.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
              <Terminal size={32} className="mb-2 text-indigo-400" />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">System Idle<br/>Waiting for Logic</p>
            </div>
          ) : (
            activeCode.map((block, i) => (
              <div 
                key={block.instanceId} 
                className={`p-3.5 rounded-2xl flex items-center justify-between text-white font-bold text-[11px] transition-all duration-300 border 
                  ${block.type === 'variable' 
                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-200' 
                    : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'}`}
              >
                <div className="flex items-center gap-3">
                   <BlockIconRenderer action={block.action} size={16} />
                   <span className="tracking-tight">{block.label}</span>
                </div>
                <button onClick={() => removeBlock(i)} disabled={gameState === 'RUNNING'} className="text-white/20 hover:text-white p-1 transition-colors"><Trash2 size={12} /></button>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={runCode} 
            disabled={gameState === 'RUNNING' || activeCode.length === 0} 
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-20 transition-all text-sm tracking-widest shadow-xl shadow-indigo-600/10"
          >
             <Play size={20} fill="currentColor" /> INITIATE_SESSION
          </button>
          <button onClick={resetGame} className="w-full py-3 bg-slate-900/50 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors text-xs active:scale-[0.98]">
            <RotateCcw size={16} /> RESET
          </button>
        </div>
      </div>

      {/* STAGE - PRO STYLE */}
      <div className="flex-1 bg-[#090e1a] rounded-[3rem] relative overflow-hidden border border-[#1e293b] shadow-inner p-8 flex flex-col items-center justify-end min-h-[400px]">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_#1e293b_1px,_transparent_1px)] bg-[size:40px_40px]" />

        {/* HUD - SLEEK GLASS */}
        <div className="absolute top-10 left-10 z-30 flex flex-col gap-2">
           <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] shadow-2xl flex items-center gap-5">
              <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400">
                <Hash size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">MEMORY: SCORE</span>
                <span className="text-white font-heading text-4xl block leading-none tabular-nums tracking-tighter">{score}</span>
              </div>
           </div>
           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> TARGET: 10_UNITS
           </div>
        </div>

        {fruits.map(f => (
          <div 
            key={f.id} 
            className="absolute transition-all duration-75 linear z-10"
            style={{ left: `${f.x}%`, top: `${f.y}%`, transform: 'translate(-50%, -50%)' }}
          >
             <div className="relative group">
               <div className="absolute inset-0 bg-emerald-500/10 blur-2xl scale-150 animate-pulse" />
               <span className="text-4xl filter drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">{f.type === 'apple' ? '🍎' : f.type === 'banana' ? '🍌' : '🍒'}</span>
             </div>
          </div>
        ))}

        <div 
          className="absolute transition-all duration-75 linear z-20"
          style={{ left: `${playerX}%`, top: '85%', width: '85px', height: '85px', transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-full h-full flex items-center justify-center animate-float-slow">
            {activeSkin === 'owl' ? <CartoonOwl isEating={false} /> : activeSkin === 'parrot' ? <CartoonParrot isEating={false} /> : <CartoonBat isEating={false} />}
          </div>
        </div>

        <div className="w-full h-6 bg-slate-950/60 rounded-full blur-2xl mb-6" />

        {gameState === 'WIN' && (
          <div className="absolute inset-0 bg-[#0c111df5] backdrop-blur-3xl z-50 flex flex-col items-center justify-center text-white animate-in zoom-in p-10 text-center">
             <div className="w-24 h-24 bg-indigo-500 rounded-3xl flex items-center justify-center mb-10 shadow-2xl shadow-indigo-500/30 animate-bounce">
                <Trophy size={48} className="text-white" />
             </div>
             <h3 className="text-5xl font-heading mb-4 tracking-tight uppercase">LOGIC MASTERED</h3>
             <p className="text-slate-400 font-semibold mb-12 uppercase tracking-[0.2em] text-xs">Variables Implemented Successfully</p>
             <button onClick={resetGame} className="bg-white text-black font-black px-16 py-5 rounded-2xl text-xl shadow-2xl hover:scale-105 active:scale-[0.98] transition-all">RE-RUN_SIMULATION</button>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
