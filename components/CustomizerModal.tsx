
import React, { useState } from 'react';
import { X, Check, Timer, Wind } from 'lucide-react';
import { BreathingPattern } from '../types';

interface CustomizerModalProps {
  onClose: () => void;
  onSave: (pattern: BreathingPattern) => void;
  theme?: 'dark' | 'light';
}

const CustomizerModal: React.FC<CustomizerModalProps> = ({ onClose, onSave, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [name, setName] = useState('自定义呼吸');
  const [inhale, setInhale] = useState(4);
  const [holdFull, setHoldFull] = useState(0);
  const [exhale, setExhale] = useState(4);
  const [holdEmpty, setHoldEmpty] = useState(0);

  const handleSave = () => {
    onSave({
      id: `custom-${Date.now()}`,
      name,
      description: `组合：吸${inhale}s - 停${holdFull}s - 呼${exhale}s - 停${holdEmpty}s`,
      inhale,
      holdFull,
      exhale,
      holdEmpty,
    });
  };

  const SliderField = ({ label, value, onChange, subtitle }: any) => (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-end mb-3">
        <div className="flex flex-col">
          <span className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</span>
        </div>
        <div className={`px-3 py-1 rounded-lg border ${
          isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
        }`}>
          <span className="text-base font-mono font-bold text-indigo-500">{value}s</span>
        </div>
      </div>
      <div className="relative flex items-center h-6">
        <input 
          type="range" 
          min="0" 
          max="15" 
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${
            isDark ? 'bg-slate-800' : 'bg-slate-200'
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className={`relative w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl border-t p-8 shadow-2xl animate-in slide-in-from-bottom duration-400 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        {/* Handle for drag (Visual only) */}
        <div className={`w-12 h-1.5 rounded-full mx-auto mb-8 sm:hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Wind size={20} />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>设定节奏</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full active:scale-95 transition-all ${
            isDark ? 'bg-slate-800/80 text-slate-400 hover:text-white' : 'bg-slate-105 text-slate-500 hover:text-slate-900'
          }`}>
            <X size={20} />
          </button>
        </header>

        <div className="space-y-8 mb-10">
          <div className="group">
            <label className={`text-[10px] font-bold uppercase tracking-widest block mb-2 px-1 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>方案名称</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={12}
              className={`w-full border rounded-2xl px-5 py-4 outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/30' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20'
              }`}
              placeholder="例如：午间冥想"
            />
          </div>

          <div className={`rounded-3xl p-6 border ${
            isDark ? 'bg-slate-950/40 border-slate-800/50' : 'bg-slate-50/50 border-slate-200/50'
          }`}>
            <SliderField label="吸气" subtitle="Inhale" value={inhale} onChange={setInhale} />
            <div className={`h-px my-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-200/50'}`} />
            <SliderField label="屏息 (满肺)" subtitle="Hold" value={holdFull} onChange={setHoldFull} />
            <div className={`h-px my-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-200/50'}`} />
            <SliderField label="呼气" subtitle="Exhale" value={exhale} onChange={setExhale} />
            <div className={`h-px my-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-200/50'}`} />
            <SliderField label="停顿 (空肺)" subtitle="Rest" value={holdEmpty} onChange={setHoldEmpty} />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className={`flex-1 py-4 rounded-2xl font-semibold active:scale-[0.97] transition-all border ${
              isDark 
                ? 'bg-slate-800 border-slate-705 text-slate-400' 
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            disabled={inhale === 0 || exhale === 0}
            className="flex-[2.5] py-4 rounded-2xl bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 active:scale-[0.97] transition-all disabled:opacity-50 disabled:grayscale"
          >
            开始训练
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizerModal;
