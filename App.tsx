
import React, { useState, useEffect, useMemo } from 'react';
import { COURSE_MODULES } from './constants';
import { Module, Lesson, UserProgress } from './types';
import  BlockEditor from '@/today/BlockEditor';
import  Shop from '@/today/Shop';
import { ArrowLeft, Zap, TreePine, Moon, Rocket, Star, ChevronRight, Coins, ShoppingBag, Check, Lock, RefreshCcw, Home } from 'lucide-react';

const App: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('codequest_progress_v2');
    const defaults: UserProgress = {
      completedModules: [],
      completedLessons: [],
      currentModuleId: 'm1',
      score: 0,
      totalCoins: 0,
      unlockedSkins: ['bat'],
      activeSkin: 'bat'
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (err) {
        return defaults;
      }
    }
    return defaults;
  });

  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<Module[]>(COURSE_MODULES);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const allLessons = useMemo(() => {
    return modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id })));
  }, [modules]);

  // Sync Progress to LocalStorage
  useEffect(() => {
    localStorage.setItem('codequest_progress_v2', JSON.stringify(progress));
    setModules(prev => prev.map((m) => {
      const isCompleted = progress.completedModules.includes(m.id);
      return { ...m, isCompleted };
    }));
  }, [progress]);

  const addCoins = (count: number) => {
    if (count <= 0) return;
    setProgress(prev => {
      const newTotal = prev.totalCoins + count;
      return {
        ...prev,
        totalCoins: newTotal,
        score: prev.score + (count * 10)
      };
    });
  };

  const resetProgress = () => {
    if (confirm("Reset everything? Your coins and levels will be lost!")) {
      localStorage.removeItem('codequest_progress_v2');
      window.location.reload();
    }
  };

  const handlePurchase = (skinId: string, price: number) => {
    if (progress.totalCoins >= price) {
      setProgress(prev => ({
        ...prev,
        totalCoins: prev.totalCoins - price,
        unlockedSkins: [...prev.unlockedSkins, skinId],
        activeSkin: skinId
      }));
    }
  };

  const handleEquip = (skinId: string) => {
    setProgress(prev => ({ ...prev, activeSkin: skinId }));
  };

  const completeLesson = (lessonId: string) => {
    const isNewLesson = !progress.completedLessons.includes(lessonId);
    setProgress(prev => {
      const newLessons = isNewLesson ? [...prev.completedLessons, lessonId] : prev.completedLessons;
      let newModules = prev.completedModules;
      let newScore = prev.score + (isNewLesson ? 50 : 0);
      if (activeModule) {
        const allLessonsDoneInModule = activeModule.lessons.every(l => l.id === lessonId || newLessons.includes(l.id));
        if (allLessonsDoneInModule && !newModules.includes(activeModule.id)) {
          newModules = [...newModules, activeModule.id];
          newScore += 200;
        }
      }
      return { ...prev, completedLessons: newLessons, completedModules: newModules, score: newScore };
    });
  };

  const handleNextLevel = () => {
    if (!activeLesson) return;
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex < allLessons.length - 1) {
      const nextLessonData = allLessons[currentIndex + 1];
      triggerContentTransition(() => {
        const mod = modules.find(m => m.id === nextLessonData.moduleId);
        if (mod) setActiveModule(mod);
        setActiveLesson(nextLessonData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } else {
      triggerContentTransition(goHome);
    }
  };

  const triggerContentTransition = (action: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      action();
      setIsTransitioning(false);
    }, 300);
  };

  const handleModuleSelect = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      triggerContentTransition(() => {
        setActiveModule(mod);
        setActiveLesson(mod.lessons[0]);
      });
    }
  };

  const handleLessonSelect = (lesson: any) => {
    triggerContentTransition(() => {
      const mod = modules.find(m => m.id === lesson.moduleId);
      if (mod) setActiveModule(mod);
      setActiveLesson(lesson);
    });
  };

  const goHome = () => {
    setActiveModule(null);
    setActiveLesson(null);
    setShowShop(false);
  };

  const isLevelUnlocked = (lessonId: string, index: number) => {
    if (index === 0) return true;
    const prevLessonId = activeModule?.lessons[index - 1].id;
    return prevLessonId && progress.completedLessons.includes(prevLessonId);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-[10%] left-[5%] text-indigo-500 blur-sm animate-float-slow"><Star size={120} /></div>
        <div className="absolute top-[60%] right-[10%] text-emerald-500 blur-md animate-pulse"><TreePine size={200} /></div>
        <div className="absolute bottom-[10%] left-[15%] text-orange-500 rotate-45"><Zap size={80} /></div>
        <div className="absolute top-[20%] right-[5%] text-indigo-400 blur-sm"><Moon size={180} /></div>
      </div>

      <header className="bg-[#020617]/80 backdrop-blur-xl border-b-4 border-slate-900 py-4 px-10 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
        <div onClick={() => triggerContentTransition(goHome)} className="flex items-center cursor-pointer group">
          <img 
            src="Million-Coders-White-text.jpg" 
            alt="BATGO! Logo" 
            className="h-16 w-auto group-hover:scale-110 group-hover:rotate-[5deg] transition-all duration-300 drop-shadow-[0_0_15px_rgba(251,146,60,0.4)]" 
          />
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => triggerContentTransition(goHome)} 
            className="flex items-center gap-2 bg-indigo-500/10 px-4 py-3 rounded-2xl border border-indigo-500/20 text-indigo-400 font-black hover:bg-indigo-500/20 transition-all group"
            title="Main Menu"
          >
            <Home size={24} className="group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline text-xs tracking-widest">MENU</span>
          </button>
          
          <button onClick={() => setShowShop(true)} className="flex items-center gap-3 bg-indigo-500/10 px-4 sm:px-6 py-3 rounded-2xl border border-indigo-500/20 text-indigo-400 font-black hover:bg-indigo-500/20 transition-all group">
            <ShoppingBag size={24} className="group-hover:scale-110 transition-transform" /> <span className="hidden md:inline text-xs tracking-widest">SHOP</span>
          </button>

          <div className="flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-2xl border border-yellow-500/20">
            <Coins className="text-yellow-400 animate-pulse" size={24} fill="currentColor" />
            <span className="text-2xl font-heading text-yellow-100 tabular-nums">{progress.totalCoins}</span>
          </div>

          <button onClick={resetProgress} className="p-3 text-slate-600 hover:text-rose-500 transition-colors" title="Reset Data">
            <RefreshCcw size={20} />
          </button>
        </div>
      </header>

      <main className={`max-w-[1400px] mx-auto mt-12 px-8 relative z-10 transition-opacity duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {showShop && <Shop coins={progress.totalCoins} unlockedSkins={progress.unlockedSkins} activeSkin={progress.activeSkin} onPurchase={handlePurchase} onEquip={handleEquip} onClose={() => setShowShop(false)} />}
        
        {!activeModule ? (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out flex flex-col items-center w-full min-h-[60vh] justify-center">
            <div className="mb-10 text-center space-y-10">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.25em] animate-pulse"><Rocket size={14} /> Mission Control</div>
              <h2 className="text-8xl md:text-9xl font-heading text-white leading-[1.1] max-w-4xl mx-auto text-center tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-400 bg-[length:200%_auto] animate-gradient-shift">BATGO!</span>
              </h2>
              
              <div className="flex flex-wrap justify-center gap-8 pt-10">
                {modules.map(mod => (
                  <button key={mod.id} onClick={() => handleModuleSelect(mod.id)} className="group bg-indigo-600 hover:bg-indigo-500 text-white font-black px-16 py-8 rounded-[2rem] text-3xl shadow-lg transition-all hover:-translate-y-1 border-b-8 border-indigo-800 flex items-center justify-center gap-4 min-w-[320px]">
                    {mod.title.toUpperCase()} <ChevronRight size={32} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 w-full">
            <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6 bg-slate-900/30 p-8 rounded-[3rem] border border-white/5 backdrop-blur-md shadow-2xl">
              <button onClick={() => triggerContentTransition(goHome)} className="flex items-center gap-3 text-indigo-300 font-black hover:text-white transition-all bg-indigo-500/10 px-8 py-3 rounded-2xl border border-indigo-500/20 group hover:bg-indigo-500/20"><ArrowLeft size={20} /> MISSION HUB</button>
              
              {/* Level Picker Circles */}
              <div className="flex items-center gap-3 bg-black/30 p-3 rounded-full border border-white/10 overflow-x-auto max-w-full scrollbar-hide">
                 {activeModule.lessons.map((lesson, idx) => {
                    const unlocked = isLevelUnlocked(lesson.id, idx);
                    const completed = progress.completedLessons.includes(lesson.id);
                    const active = activeLesson?.id === lesson.id;
                    
                    return (
                      <button 
                        key={lesson.id}
                        disabled={!unlocked}
                        onClick={() => handleLessonSelect({ ...lesson, moduleId: activeModule.id })}
                        className={`relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all transform hover:scale-110 active:scale-95
                          ${active ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-[#020617] scale-110' : ''}
                          ${completed ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
                            unlocked ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 
                            'bg-slate-800 text-slate-500 cursor-not-allowed'}
                        `}
                      >
                         {completed ? <Check size={20} /> : !unlocked ? <Lock size={16} /> : idx + 1}
                      </button>
                    )
                 })}
              </div>

              <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl text-emerald-400 font-black text-xs uppercase border border-emerald-500/20">
                {progress.completedModules.includes(activeModule.id) ? <Check size={14} /> : null} {progress.completedModules.includes(activeModule.id) ? 'Mastered' : 'In Progress'}
              </div>
            </div>

            <div className="flex flex-col gap-10">
                <div className="w-full">
                  {activeLesson && (
                    <div className="animate-in fade-in duration-700">
                      {activeLesson.type === 'project' && (
                        <BlockEditor 
                          levelId={activeLesson.miniProjectLevelId}
                          activeSkin={progress.activeSkin}
                          onWin={() => completeLesson(activeLesson.id)}
                          onNext={handleNextLevel}
                          onCollect={addCoins}
                        />
                      )}
                      {activeLesson.type === 'text' && (
                        <div className="bg-slate-900/40 p-12 rounded-[3.5rem] border border-white/5 backdrop-blur-md shadow-2xl text-center">
                          <h2 className="text-5xl font-heading mb-8 text-white">{activeLesson.title}</h2>
                          <div className="prose prose-invert max-w-none mx-auto">
                            <p className="text-2xl text-slate-300 leading-relaxed mb-12">{activeLesson.content}</p>
                          </div>
                          <button 
                            onClick={() => completeLesson(activeLesson.id)}
                            className={`inline-flex items-center gap-4 font-black px-12 py-5 rounded-3xl text-xl transition-all ${progress.completedLessons.includes(activeLesson.id) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:-translate-y-1 hover:shadow-emerald-500/20'}`}
                          >
                            <Check size={28} /> {progress.completedLessons.includes(activeLesson.id) ? 'COMPLETED' : 'MARK AS COMPLETE'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
