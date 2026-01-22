
import React, { useState, useEffect, useRef } from 'react';
import { AVAILABLE_BLOCKS } from '../constants';
import { Play, RotateCcw, Trash2, Trophy, Sparkles, Wind, Zap, Star, AlertCircle, CloudLightning } from 'lucide-react';
import { CartoonBat, CartoonOwl, CartoonParrot } from './BirdSkins';

interface Point {
  x: number;
  y: number;
}

interface Obstacle extends Point {
  id: number;
}

export const CollisionGame: React.FC<{
  activeSkin?: string;
  onWin?: () => void;
  onCollect?: (count: number) => void;
}> = ({ activeSkin = 'bat', onWin, onCollect }) => {
  const [activeCode, setActiveCode] = useState<any[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'WIN' | 'FAIL'>('IDLE');
  const [birdPos, setBirdPos] = useState<Point>({ x: 50, y: 50 });
  const [birdDir, setBirdDir] = useState<Point>({ x: 1, y: 0.5 });
  const [starsCollected, setStarsCollected] = useState(0);
  const [targetStar, setTargetStar] = useState<Point>({ x: 70, y: 30 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isFlapping, setIsFlapping] = useState(false);
  const [birdColor, setBirdColor] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);

  const requestRef = useRef<number>(null);
  const codeRef = useRef<any[]>([]);
  const isRunningRef = useRef(false);

  useEffect(() => {
    codeRef.current = activeCode;
  }, [activeCode]);

  useEffect(() => {
    spawnLevel();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const spawnLevel = () => {
    // Spawn Target
    const starPos = {
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60
    };
    setTargetStar(starPos);

    // Spawn 2-3 Obstacles far enough from start (50, 50) and target
    const newObstacles: Obstacle[] = [];
    for (let i = 0; i < 3; i++) {
      let ox, oy;
      let tooClose = true;
      let attempts = 0;
      
      while (tooClose && attempts < 15) {
        ox = 15 + Math.random() * 70;
        oy = 15 + Math.random() * 70;
        
        const distToStart = Math.sqrt(Math.pow(ox - 50, 2) + Math.pow(oy - 50, 2));
        const distToStar = Math.sqrt(Math.pow(ox - starPos.x, 2) + Math.pow(oy - starPos.y, 2));
        
        if (distToStart > 20 && distToStar > 20) {
          tooClose = false;
        }
        attempts++;
      }
      if (ox && oy) newObstacles.push({ x: ox, y: oy, id: Date.now() + i });
    }
    setObstacles(newObstacles);
  };

  const resetGame = () => {
    isRunningRef.current = false;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    setGameState('IDLE');
    setBirdPos({ x: 50, y: 50 });
    setBirdDir({ x: 1, y: 0.5 });
    setStarsCollected(0);
    setBirdColor(null);
    setIsFlapping(false);
    setTrail([]);
    spawnLevel();
  };

  const addBlock = (block: any) => {
    if (isRunningRef.current) return;
    setActiveCode(prev => [...prev, { ...block, instanceId: Math.random() }]);
  };

  const removeBlock = (index: number) => {
    if (isRunningRef.current) return;
    setActiveCode(prev => prev.filter((_, i) => i !== index));
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const runCode = () => {
    if (activeCode.length === 0) return;
    
    isRunningRef.current = true;
    setGameState('RUNNING');
    setIsFlapping(true);

    const animate = () => {
      if (!isRunningRef.current) return;

      const code = codeRef.current;
      const hasForever = code.some(b => b.action === 'FOREVER');
      const hasIfEdge = code.some(b => b.action === 'IF_EDGE');
      const hasBounce = code.some(b => b.action === 'BOUNCE');
      const hasColor = code.some(b => b.action === 'COLOR');
      const hasUp = code.some(b => b.action === 'MOVE_UP');
      const hasRight = code.some(b => b.action === 'MOVE_RIGHT');

      setBirdPos(prev => {
        let speed = 0.7;
        let dx = birdDir.x;
        let dy = birdDir.y;

        if (hasUp && !hasForever) dy = -1;
        if (hasRight && !hasForever) dx = 1;

        if (!hasForever) {
          speed *= 0.99; 
          if (speed < 0.1) {
            isRunningRef.current = false;
            setGameState('FAIL');
            setIsFlapping(false);
            return prev;
          }
        }

        let nx = prev.x + dx * speed;
        let ny = prev.y + dy * speed;

        // Border Collision
        const margin = 10;
        let wallBounce = false;

        if (nx > 100 - margin || nx < margin) {
          if (hasIfEdge && hasBounce) {
            setBirdDir(d => ({ ...d, x: -d.x }));
            wallBounce = true;
            nx = nx > 100 - margin ? 100 - margin : margin;
          } else {
            isRunningRef.current = false;
            setGameState('FAIL');
            return prev;
          }
        }
        
        if (ny > 100 - margin || ny < margin) {
          if (hasIfEdge && hasBounce) {
            setBirdDir(d => ({ ...d, y: -d.y }));
            wallBounce = true;
            ny = ny > 100 - margin ? 100 - margin : margin;
          } else {
            isRunningRef.current = false;
            setGameState('FAIL');
            return prev;
          }
        }

        if (wallBounce) {
          triggerShake();
          if (hasColor) setBirdColor(`hsl(${Math.random() * 360}, 80%, 60%)`);
        }

        // Obstacle Collision Check
        for (const obs of obstacles) {
          const distToObs = Math.sqrt(Math.pow(nx - obs.x, 2) + Math.pow(ny - obs.y, 2));
          if (distToObs < 10) {
            isRunningRef.current = false;
            setGameState('FAIL');
            triggerShake();
            return prev;
          }
        }

        // Star Collection
        const distToStar = Math.sqrt(Math.pow(nx - targetStar.x, 2) + Math.pow(ny - targetStar.y, 2));
        if (distToStar < 10) {
          setStarsCollected(s => {
            const next = s + 1;
            if (next >= 5) {
              isRunningRef.current = false;
              setGameState('WIN');
              if (onWin) onWin();
              if (onCollect) onCollect(50);
            }
            return next;
          });
          spawnLevel(); // Refresh layout on collection
        }

        setTrail(t => [{x: nx, y: ny, id: Date.now()}, ...t].slice(0, 10));
        return { x: nx, y: ny };
      });

      if (isRunningRef.current) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
  };

  const renderActiveBird = () => {
    const props = { isEating: false, isFlapping, className: birdColor ? 'filter' : '' };
    const style = birdColor ? { filter: `drop-shadow(0 0 20px ${birdColor}) brightness(1.2)` } : {};
    
    return (
      <div style={style} className="w-full h-full flex items-center justify-center">
        {activeSkin === 'owl' ? <CartoonOwl {...props} /> : 
         activeSkin === 'parrot' ? <CartoonParrot {...props} /> : 
         <CartoonBat {...props} />}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      <div className="flex flex-col lg:flex-row w-full min-h-[600px] bg-[#0c111d] rounded-[3rem] border-4 border-[#1e293b] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* SPELLS TOOLBOX */}
        <div className="w-full lg:w-[130px] bg-[#090e1a] p-4 flex lg:flex-col gap-4 border-r border-[#1e293b] overflow-x-auto lg:overflow-x-visible scrollbar-hide">
          <h4 className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 text-center">Spells</h4>
          {AVAILABLE_BLOCKS.map(block => (
            <button 
              key={block.id} 
              onClick={() => addBlock(block)} 
              disabled={gameState === 'RUNNING'}
              className={`shrink-0 w-16 h-16 lg:w-full aspect-square rounded-2xl flex flex-col items-center justify-center text-white shadow-lg transition-all active:scale-90 hover:brightness-110 disabled:opacity-30 disabled:grayscale ${
                block.type === 'control' ? 'bg-orange-600 shadow-[0_4px_0_#9a3412]' : 
                block.type === 'looks' ? 'bg-pink-600 shadow-[0_4px_0_#9d174d]' : 'bg-indigo-600 shadow-[0_4px_0_#1e3a8a]'
              }`}
            >
              <span className="text-2xl">{block.icon}</span>
              <span className="text-[9px] font-black uppercase mt-1 leading-tight text-center">{block.label}</span>
            </button>
          ))}
        </div>

        {/* WORKSPACE */}
        <div className="w-full lg:w-[260px] bg-[#0c111d] p-6 flex flex-col border-r border-[#1e293b]">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Workspace</h4>
            <div className={`h-2 w-2 rounded-full ${gameState === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
          </div>
          
          <div className="flex-1 min-h-[250px] border-2 border-dashed border-slate-800 rounded-[2rem] p-4 flex flex-col gap-3 overflow-y-auto mb-6 scrollbar-hide">
            {activeCode.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
                <Zap size={32} className="mb-2 text-indigo-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Tap spells to<br/>add code</p>
              </div>
            )}
            {activeCode.map((block, i) => (
              <div key={block.instanceId} className={`p-4 rounded-2xl bg-slate-800/80 border-l-4 border-indigo-500 text-white font-black text-xs flex justify-between items-center transition-all ${gameState === 'RUNNING' && block.action === 'FOREVER' ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : ''}`}>
                <span className="flex items-center gap-3"><span className="text-xl">{block.icon}</span> {block.label}</span>
                <button 
                  onClick={() => removeBlock(i)} 
                  disabled={gameState === 'RUNNING'}
                  className="text-slate-600 hover:text-red-400 p-1 disabled:opacity-20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={runCode} 
              disabled={gameState === 'RUNNING' || activeCode.length === 0}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black rounded-2xl border-b-8 border-emerald-800 disabled:border-slate-900 active:border-b-0 active:translate-y-2 transition-all text-xl flex items-center justify-center gap-3 shadow-2xl"
            >
              <Play fill="currentColor" size={24} /> LAUNCH!
            </button>
            <button 
              onClick={resetGame}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-2xl border-b-4 border-slate-900 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> RESET
            </button>
          </div>
        </div>

        {/* GAME STAGE */}
        <div className={`flex-1 relative bg-[#020617] p-8 overflow-hidden transition-transform duration-75 ${shake ? 'animate-shake' : ''}`}>
          {/* HUD Overlay */}
          <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-30 pointer-events-none">
            <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto">
              <div className="bg-yellow-500/20 p-2 rounded-xl">
                <Star className="text-yellow-400 animate-spin-slow" size={24} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Magic Stars</span>
                <span className="text-white font-heading text-2xl leading-none">{starsCollected} / 5</span>
              </div>
            </div>
            
            <div className={`px-6 py-3 rounded-2xl border font-black text-[10px] tracking-widest flex items-center gap-3 transition-all pointer-events-auto ${gameState === 'RUNNING' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
               <div className={`h-2 w-2 rounded-full ${gameState === 'RUNNING' ? 'bg-emerald-500 animate-ping' : 'bg-slate-700'}`} />
               {gameState === 'RUNNING' ? 'LIVE FLIGHT' : 'SYSTEM IDLE'}
            </div>
          </div>

          {/* Collectible Magic Star */}
          <div 
            className="absolute transition-all duration-500 ease-out z-10"
            style={{ left: `${targetStar.x}%`, top: `${targetStar.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse scale-150" />
              <Star className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-bounce" size={48} fill="currentColor" />
            </div>
          </div>

          {/* Storm Cloud Obstacles */}
          {obstacles.map(obs => (
            <div 
              key={obs.id}
              className="absolute transition-all duration-700 ease-in-out z-10"
              style={{ left: `${obs.x}%`, top: `${obs.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="text-indigo-400 animate-float-slow filter drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]">
                  <CloudLightning size={64} className="animate-pulse" />
                </div>
                {/* Visual "Zap" Radius Indicator */}
                <div className="absolute inset-0 border-2 border-dashed border-indigo-500/10 rounded-full scale-[1.5] animate-spin-slow opacity-20" />
              </div>
            </div>
          ))}

          {/* Visual Trail */}
          {trail.map((p, i) => (
            <div 
              key={p.id} 
              className="absolute bg-indigo-500/30 rounded-full blur-md pointer-events-none"
              style={{ 
                left: `${p.x}%`, 
                top: `${p.y}%`, 
                width: `${12 - i}px`, 
                height: `${12 - i}px`, 
                opacity: (12 - i) / 12,
                transform: 'translate(-50%, -50%)' 
              }}
            />
          ))}

          {/* The Character */}
          <div 
            className="absolute transition-all duration-75 ease-linear z-20" 
            style={{ 
              left: `${birdPos.x}%`, 
              top: `${birdPos.y}%`, 
              width: '100px', 
              height: '100px', 
              transform: `translate(-50%, -50%) scale(${birdDir.x > 0 ? 1 : -1}, 1)` 
            }}
          >
             {renderActiveBird()}
          </div>

          {/* Screen Overlays */}
          {gameState === 'WIN' && (
            <div className="absolute inset-0 bg-[#0c111ddf] backdrop-blur-2xl flex flex-col items-center justify-center text-white z-40 animate-in zoom-in p-10 text-center">
              <Trophy size={120} className="text-yellow-400 mb-8 drop-shadow-[0_0_40px_rgba(250,204,21,0.6)] animate-bounce" />
              <h3 className="text-5xl font-heading mb-4 tracking-tighter">SKY LEGEND!</h3>
              <p className="text-slate-400 font-bold text-lg mb-10 max-w-md">You avoided the storm and collected all stars!</p>
              <button onClick={resetGame} className="bg-white text-indigo-950 font-black px-16 py-6 rounded-[2rem] text-2xl shadow-2xl hover:scale-105 active:translate-y-2 border-b-8 border-slate-300 transition-all">PLAY AGAIN</button>
            </div>
          )}

          {gameState === 'FAIL' && (
            <div className="absolute inset-0 bg-[#0c111ddf] backdrop-blur-xl flex flex-col items-center justify-center text-white z-40 animate-in fade-in p-10 text-center">
              <div className="bg-rose-500/20 p-8 rounded-full mb-8"><AlertCircle size={80} className="text-rose-500" /></div>
              <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">ZAPPED!</h3>
              <p className="text-rose-200 font-bold mb-10 max-w-xs">Avoid the storm clouds or stay in bounds! Use your code to fly safely.</p>
              <button onClick={resetGame} className="bg-white text-rose-950 font-black px-12 py-5 rounded-[1.5rem] text-xl shadow-xl hover:scale-105 border-b-8 border-slate-300 transition-all">FIX MY SPELL</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-3px, -1px); }
          20%, 40%, 60%, 80% { transform: translate(3px, 1px); }
        }
        .animate-shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 5s linear infinite; }
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
