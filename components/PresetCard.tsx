
import React from 'react';
import { Play, ChevronRight, Clock } from 'lucide-react';
import { BreathingPattern } from '../types';

interface PresetCardProps {
  pattern: BreathingPattern;
  onSelect: () => void;
  isCustom?: boolean;
  theme?: 'dark' | 'light';
}

const PresetCard: React.FC<PresetCardProps> = ({ pattern, onSelect, isCustom, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const totalCycle = pattern.inhale + pattern.holdFull + pattern.exhale + pattern.holdEmpty;

  return (
    <button 
      onClick={onSelect}
      className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left border transition-all active:scale-[0.98] group ${
        isDark 
          ? 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50' 
          : 'bg-white hover:bg-slate-50 border-slate-100 shadow-sm shadow-slate-200/50'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
        isCustom 
          ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600') 
          : (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-500/10 text-indigo-600')
      } group-hover:scale-110 transition-transform`}>
        <Play size={20} fill="currentColor" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h3 className={`font-semibold text-sm transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>{pattern.name}</h3>
          <div className={`flex items-center gap-1 text-[10px] font-mono shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Clock size={10} />
            <span>单次 {totalCycle}s</span>
          </div>
        </div>
        <p className={`text-xs mt-1 leading-relaxed transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{pattern.description}</p>
      </div>
      <ChevronRight size={16} className={`shrink-0 transition-colors ${isDark ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-500'}`} />
    </button>
  );
};

export default PresetCard;
