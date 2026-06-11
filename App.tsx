import React, { useState, useEffect } from 'react';
import { Plus, Smartphone, Share2, X, Sun, Moon } from 'lucide-react';
import { BreathingPattern } from './types';
import { PRESETS } from './constants';
import ExerciseScreen from './components/ExerciseScreen';
import PresetCard from './components/PresetCard';
import CustomizerModal from './components/CustomizerModal';

const App: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [customPatterns, setCustomPatterns] = useState<BreathingPattern[]>([]);
  
  // Choose or restore theme preference ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('zenbreath_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const saved = localStorage.getItem('zenbreath_custom_patterns');
    if (saved) {
      try {
        setCustomPatterns(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zenbreath_custom_patterns', JSON.stringify(customPatterns));
  }, [customPatterns]);

  // Handle setting light/dark theme classes globally
  useEffect(() => {
    localStorage.setItem('zenbreath_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const handleStartSession = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
    setIsStarted(true);
  };

  const handleAddCustom = (newPattern: BreathingPattern) => {
    setCustomPatterns(prev => [...prev, newPattern]);
    setIsCustomizing(false);
    handleStartSession(newPattern);
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPatterns(prev => prev.filter(p => p.id !== id));
  };

  const isDark = theme === 'dark';

  if (isStarted && selectedPattern) {
    return (
      <ExerciseScreen 
        pattern={selectedPattern} 
        onExit={() => setIsStarted(false)} 
        hapticsEnabled={hapticsEnabled}
        theme={theme}
      />
    );
  }

  return (
    <div className={`min-h-screen gradient-bg flex flex-col p-6 pb-24 transition-colors duration-500 ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      <header className="flex justify-between items-start mb-10 pt-4">
        <div>
          <h1 className={`text-3xl font-light tracking-tight mb-1 transition-colors duration-400 ${isDark ? 'text-white' : 'text-slate-900'}`}>ZenBreath</h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs flex items-center gap-1.5 transition-colors duration-400`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            深呼吸，感知当下
          </p>
        </div>
        <div className="flex gap-2">
          {/* Light/Dark Theme Switcher - "添加黑暗白天模式" */}
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2.5 rounded-full border transition-all active:scale-90 ${
              isDark 
                ? 'border-slate-700/50 bg-slate-800/80 text-amber-400 hover:text-amber-300' 
                : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-50 shadow-sm shadow-slate-200/50'
            }`}
            title={isDark ? '切换到白天模式' : '切换到黑暗模式'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            onClick={() => setHapticsEnabled(!hapticsEnabled)}
            className={`p-2.5 rounded-full border transition-all active:scale-90 ${
              hapticsEnabled 
                ? (isDark ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600') 
                : (isDark ? 'bg-slate-800/80 border-slate-700/50 text-slate-500' : 'bg-white border-slate-200 text-slate-400')
            }`}
            title={hapticsEnabled ? '触感反馈已开启' : '触感反馈已关闭'}
          >
            <Smartphone size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-8 max-w-xl mx-auto w-full">
        <section>
          <div className="flex items-center mb-4">
            <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap mr-4 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>经典模式</h2>
            <div className={`h-px w-full transition-colors ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {PRESETS.map(pattern => (
              <PresetCard key={pattern.id} pattern={pattern} onSelect={() => handleStartSession(pattern)} theme={theme} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center mb-4">
            <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap mr-4 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>我的方案</h2>
            <div className={`h-px w-full transition-colors ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
          <div className="grid grid-cols-1 gap-3 mb-4">
            {customPatterns.map(pattern => (
              <div key={pattern.id} className="relative group">
                <PresetCard pattern={pattern} onSelect={() => handleStartSession(pattern)} isCustom theme={theme} />
                <button 
                  onClick={(e) => handleDeleteCustom(pattern.id, e)}
                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 shadow-md shadow-slate-100'
                  }`}
                  title="删除方案"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsCustomizing(true)}
            className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isDark 
                ? 'border-slate-800 text-slate-500 hover:border-indigo-500/30 hover:text-indigo-400' 
                : 'border-slate-200 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-600 bg-white/40 hover:bg-white shadow-sm shadow-slate-100/50'
            }`}
          >
            <Plus size={18} />
            <span className="text-sm font-semibold">添加自定义呼吸方案</span>
          </button>
        </section>
      </div>

      <footer className="text-center mt-12 opacity-60">
        <p className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${isDark ? 'text-slate-600' : 'text-slate-405'}`}>ZenBreath v1.0 • 已开启本地同步</p>
      </footer>

      {isCustomizing && (
        <CustomizerModal 
          onClose={() => setIsCustomizing(false)} 
          onSave={handleAddCustom}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;
