
import React from 'react';
import { Module } from './types';
import { Lock, CheckCircle, PlayCircle, Zap } from 'lucide-react';

interface ModuleCardProps {
  module: Module;
  onSelect: (module: Module) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onSelect }) => {
  return (
    <div 
      onClick={() => !module.isLocked && onSelect(module)}
      className={`group relative p-8 rounded-[2.5rem] border-4 transition-all duration-500 cursor-pointer overflow-hidden
        ${module.isLocked 
          ? 'bg-slate-900/50 border-slate-800 opacity-60 grayscale cursor-not-allowed' 
          : 'bg-slate-900 border-indigo-900/50 hover:border-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:-translate-y-2'
        }`}
    >
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-2xl ${module.isLocked ? 'bg-slate-800' : 'bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all'}`}>
          <Zap size={24} />
        </div>
        
        {module.isLocked ? (
          <div className="bg-slate-800 p-2 rounded-full"><Lock className="text-slate-500" size={20} /></div>
        ) : module.isCompleted ? (
          <div className="bg-emerald-500 p-2 rounded-full shadow-lg shadow-emerald-500/20"><CheckCircle className="text-white" size={20} /></div>
        ) : (
          <div className="bg-indigo-500 p-2 rounded-full animate-pulse shadow-lg shadow-indigo-500/20"><PlayCircle className="text-white" size={20} /></div>
        )}
      </div>

      <div className="relative z-10 space-y-4">
        <h3 className={`text-2xl font-heading tracking-tight ${module.isLocked ? 'text-slate-500' : 'text-slate-100'}`}>
          {module.title}
        </h3>
        
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          {module.description}
        </p>
        
        <div className="pt-4 flex items-center gap-3">
          <div className="h-3 flex-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-[2px]">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${module.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: module.isCompleted ? '100%' : '15%' }}
            ></div>
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase">
            {module.isCompleted ? 'Mastered' : 'Explore'}
          </span>
        </div>
      </div>
    </div>
  );
};
