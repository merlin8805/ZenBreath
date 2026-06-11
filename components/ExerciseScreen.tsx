import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Pause, Play, VolumeX, Wind, CloudRain, Waves } from 'lucide-react';
import { BreathingPattern, BreathingStep, SessionState } from '../types';

// Custom fully synthesized high-fidelity Web Audio API engine
// 100% offline-safe, free from Autoplay blockages, perfect loops, and CORS issues
class WebAudioNoiseSynth {
  private ctx: AudioContext | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private mainGain: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private intervalId: any = null;
  public track: string = 'none';

  constructor() {}

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume();
      } catch (e) {
        console.warn('Click-to-play required:', e);
      }
    }
  }

  play(track: string) {
    this.stop();
    this.init();
    if (!this.ctx) return;

    this.track = track;
    if (track === 'none') return;

    try {
      // Main gain node for smooth fade-in and soft volume scaling - "三种声音都小一点"
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.mainGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.2);
      this.mainGain.connect(this.ctx.destination);

      // Create comfortable organic noise buffer
      const bufferSize = this.ctx.sampleRate * 4; // 4 second custom noise
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const channelData = buffer.getChannelData(0);

      // Low frequency pink/brownish organic noise creation
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // 1-pole filter to output deep, soothing brownian frequency roll-off
        lastOut = 0.92 * lastOut + 0.08 * white;
        channelData[i] = lastOut * 1.5;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = buffer;
      this.noiseSource.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();

      if (track === 'rain') {
        // "竹林听雨": Deep gentle lowpass + subtle rain crackles
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(1000, this.ctx.currentTime);
        
        this.noiseSource.connect(this.filterNode);
        this.filterNode.connect(this.mainGain);
        this.noiseSource.start(0);

        // Soft cracking raindrop impulses (made much quieter)
        this.intervalId = setInterval(() => {
          if (!this.ctx || !this.mainGain || this.track !== 'rain') return;
          if (Math.random() < 0.4) {
            const osc = this.ctx.createOscillator();
            const pGain = this.ctx.createGain();
            osc.connect(pGain);
            pGain.connect(this.mainGain);
            
            osc.type = 'sine';
            const frequency = 600 + Math.random() * 900;
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.08);

            pGain.gain.setValueAtTime(0.006, this.ctx.currentTime);
            pGain.gain.exponentialRampToValueAtTime(0.0005, this.ctx.currentTime + 0.1);
            
            osc.start();
            try { osc.stop(this.ctx.currentTime + 0.12); } catch (e) {}
          }
        }, 130);

      } else if (track === 'ocean') {
        // "幽谷山泉": Dynamic water flowing stream with bubbling ripples
        this.filterNode.type = 'bandpass';
        this.filterNode.Q.setValueAtTime(1.8, this.ctx.currentTime);
        this.filterNode.frequency.setValueAtTime(450, this.ctx.currentTime);

        this.noiseSource.connect(this.filterNode);
        this.filterNode.connect(this.mainGain);
        this.noiseSource.start(0);

        // Bubbling frequency swing
        this.lfoNode = this.ctx.createOscillator();
        this.lfoNode.type = 'sine';
        this.lfoNode.frequency.setValueAtTime(0.3, this.ctx.currentTime);

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(110, this.ctx.currentTime);

        this.lfoNode.connect(lfoGain);
        lfoGain.connect(this.filterNode.frequency);
        this.lfoNode.start(0);

        // Random gurgling water splash/ripple effects
        this.intervalId = setInterval(() => {
          if (!this.ctx || !this.mainGain || this.track !== 'ocean') return;
          if (Math.random() < 0.55) {
            const osc = this.ctx.createOscillator();
            const pGain = this.ctx.createGain();
            osc.connect(pGain);
            pGain.connect(this.mainGain);

            osc.type = 'sine';
            const bubbleFreq = 450 + Math.random() * 850;
            osc.frequency.setValueAtTime(bubbleFreq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(bubbleFreq + 250, this.ctx.currentTime + 0.14);

            const splashVol = 0.002 + Math.random() * 0.004;
            pGain.gain.setValueAtTime(splashVol, this.ctx.currentTime);
            pGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.14);

            osc.start();
            try { osc.stop(this.ctx.currentTime + 0.16); } catch (e) {}
          }
        }, 90);

      } else if (track === 'wind') {
        // "松林晚风": Gentle breeze passing through pine leaves
        this.filterNode.type = 'bandpass';
        this.filterNode.Q.setValueAtTime(2.0, this.ctx.currentTime);
        this.filterNode.frequency.setValueAtTime(310, this.ctx.currentTime);

        // Modulating wind gusts
        this.lfoNode = this.ctx.createOscillator();
        this.lfoNode.type = 'sine';
        this.lfoNode.frequency.setValueAtTime(0.06, this.ctx.currentTime);

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(110, this.ctx.currentTime);

        this.lfoNode.connect(lfoGain);
        lfoGain.connect(this.filterNode.frequency);

        this.noiseSource.connect(this.filterNode);
        this.filterNode.connect(this.mainGain);

        this.noiseSource.start(0);
        this.lfoNode.start(0);
      }
    } catch (e) {
      console.error('Synthesis initialization failed:', e);
    }
  }

  setVolume(vol: number) {
    if (this.mainGain && this.ctx) {
      try {
        this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, this.ctx.currentTime);
        this.mainGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.4);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  pause() {
    this.setVolume(0);
  }

  resume() {
    this.init();
    if (this.track !== 'none') {
      this.setVolume(0.12);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.lfoNode) {
      try { this.lfoNode.stop(); } catch (e) {}
      this.lfoNode = null;
    }
    if (this.noiseSource) {
      try { this.noiseSource.stop(); } catch (e) {}
      this.noiseSource = null;
    }
    if (this.mainGain && this.ctx) {
      const g = this.mainGain;
      try {
        g.gain.setValueAtTime(g.gain.value, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
      } catch (e) {
        console.warn(e);
      }
      setTimeout(() => {
        try { g.disconnect(); } catch (e) {}
      }, 500);
      this.mainGain = null;
    }
    this.track = 'none';
  }
}

interface ExerciseScreenProps {
  pattern: BreathingPattern;
  onExit: () => void;
  hapticsEnabled: boolean;
  theme?: 'dark' | 'light';
}

const ExerciseScreen: React.FC<ExerciseScreenProps> = ({ pattern, onExit, hapticsEnabled, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  
  const [session, setSession] = useState<SessionState>({
    isActive: true,
    currentStep: 'inhale',
    remainingSeconds: pattern.inhale,
    totalElapsed: 0,
  });

  const [isPaused, setIsPaused] = useState(false);
  const [currentStepDuration, setCurrentStepDuration] = useState(pattern.inhale);
  
  // White Noise selection state (persisted in local storage)
  const [activeNoise, setActiveNoise] = useState<'none' | 'rain' | 'ocean' | 'wind'>(() => {
    return (localStorage.getItem('zenbreath_active_noise') as any) || 'none';
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const synthRef = useRef<WebAudioNoiseSynth | null>(null);

  const triggerHaptic = (type: 'light' | 'medium') => {
    if (hapticsEnabled && 'vibrate' in navigator) {
      navigator.vibrate(type === 'light' ? 20 : 50);
    }
  };

  // Instantiate Synthesizer on Mount
  useEffect(() => {
    synthRef.current = new WebAudioNoiseSynth();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  // Sync Synthesizer with User selection
  useEffect(() => {
    if (synthRef.current) {
      if (activeNoise === 'none') {
        synthRef.current.stop();
      } else {
        localStorage.setItem('zenbreath_active_noise', activeNoise);
        synthRef.current.play(activeNoise);
        if (isPaused) {
          synthRef.current.pause();
        }
      }
    }
  }, [activeNoise]);

  // Sync Synthesizer with Pause state
  useEffect(() => {
    if (synthRef.current) {
      if (isPaused) {
        synthRef.current.pause(); // Dim volume smoothly to 0 during pause
      } else {
        synthRef.current.resume(); // Ramp volume back up smoothly to 0.3
      }
    }
  }, [isPaused]);

  useEffect(() => {
    if (session.isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSession(prev => {
          if (prev.remainingSeconds > 1) {
            return { ...prev, remainingSeconds: prev.remainingSeconds - 1, totalElapsed: prev.totalElapsed + 1 };
          } else {
            let nextStep: BreathingStep = 'inhale';
            let nextDuration = 0;

            switch (prev.currentStep) {
              case 'inhale':
                if (pattern.holdFull > 0) {
                  nextStep = 'holdFull';
                  nextDuration = pattern.holdFull;
                } else {
                  nextStep = 'exhale';
                  nextDuration = pattern.exhale;
                }
                break;
              case 'holdFull':
                nextStep = 'exhale';
                nextDuration = pattern.exhale;
                break;
              case 'exhale':
                if (pattern.holdEmpty > 0) {
                  nextStep = 'holdEmpty';
                  nextDuration = pattern.holdEmpty;
                } else {
                  nextStep = 'inhale';
                  nextDuration = pattern.inhale;
                }
                break;
              case 'holdEmpty':
                nextStep = 'inhale';
                nextDuration = pattern.inhale;
                break;
            }

            setCurrentStepDuration(nextDuration);
            triggerHaptic('medium');
            return {
              ...prev,
              currentStep: nextStep,
              remainingSeconds: nextDuration,
              totalElapsed: prev.totalElapsed + 1
            };
          }
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session.isActive, isPaused, pattern]);

  const getStepText = (step: BreathingStep) => {
    switch (step) {
      case 'inhale': return '吸气';
      case 'holdFull': return '屏息';
      case 'exhale': return '呼气';
      case 'holdEmpty': return '空息';
    }
  };

  // OPTIMIZED scale levels so the circle is distinct but never overly large (reduced from 1.8 to 1.35 max scale)
  const getTargetScale = () => {
    switch (session.currentStep) {
      case 'inhale': return 1.35;
      case 'holdFull': return 1.35;
      case 'exhale': return 1.0;
      case 'holdEmpty': return 1.0;
    }
  };

  const isVibrating = (session.currentStep === 'holdFull' || session.currentStep === 'holdEmpty') && !isPaused;

  const getStepColorClass = () => {
    switch (session.currentStep) {
      case 'inhale': return isDark ? 'text-cyan-400' : 'text-cyan-600';
      case 'holdFull': return isDark ? 'text-indigo-400' : 'text-indigo-600';
      case 'exhale': return isDark ? 'text-teal-400' : 'text-teal-600';
      case 'holdEmpty': return isDark ? 'text-slate-400' : 'text-slate-500';
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const noiseTracks = [
    { id: 'none', name: '静音', icon: <VolumeX size={14} /> },
    { id: 'wind', name: '松林晚风', icon: <Wind size={14} /> },
    { id: 'rain', name: '竹林听雨', icon: <CloudRain size={14} /> },
    { id: 'ocean', name: '幽谷山泉', icon: <Waves size={14} /> },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 overflow-hidden select-none transition-colors duration-500 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <header className={`w-full flex justify-between items-center z-10 pt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <button onClick={onExit} className={`p-2 -ml-2 active:opacity-60 transition-opacity ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className={`text-sm font-semibold tracking-wide transition-colors duration-400 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{pattern.name}</h2>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative w-full">
        {/* Background Decorative Rings */}
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className={`w-[85vw] h-[85vw] rounded-full border animate-pulse opacity-10 transition-colors duration-400 ${isDark ? 'border-slate-800' : 'border-slate-300'}`} />
          <div className={`w-[65vw] h-[65vw] rounded-full border animate-pulse opacity-20 delay-300 transition-colors duration-400 ${isDark ? 'border-slate-800' : 'border-slate-300'}`} />
          <div className={`w-[45vw] h-[45vw] rounded-full border animate-pulse opacity-30 delay-700 transition-colors duration-400 ${isDark ? 'border-slate-800' : 'border-slate-300'}`} />
        </div>

        {/* Outer scale wrapper for continuous expansion/contraction */}
        <div 
          className="relative w-48 h-48 flex items-center justify-center transition-transform ease-linear"
          style={{ 
            transitionDuration: isPaused ? '0s' : `${currentStepDuration}s`,
            transform: `scale(${getTargetScale()})`,
            willChange: 'transform'
          }}
        >
          {/* Inner vibration wrapper for hold phases */}
          <div 
            className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-700 border-2 border-current shadow-[0_0_50px_-10px_currentColor] ${getStepColorClass()} ${isVibrating ? 'animate-vibrate' : ''} ${
              isDark ? 'bg-slate-900/10' : 'bg-white/40'
            }`}
          >
            {/* Display current instruction and countdown */}
            <div className="flex flex-col items-center justify-center scale-[0.62] transition-opacity duration-300" style={{ opacity: isPaused ? 0.3 : 1 }}>
               <span className={`text-5xl font-light mb-2 transition-colors duration-400 ${isDark ? 'text-white' : 'text-slate-905'}`}>{getStepText(session.currentStep)}</span>
               <span className={`text-6xl font-mono font-semibold transition-colors duration-400 ${isDark ? 'text-white' : 'text-slate-800'}`}>{session.remainingSeconds}</span>
            </div>

            {/* Pause Status Overlay */}
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center text-white/40 bg-slate-950/20 rounded-full backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Pause size={32} fill="currentColor" className="text-indigo-400" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">训练暂停</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase Progress Indicators */}
        <div className="mt-20 flex gap-4 z-10">
          {(['inhale', 'holdFull', 'exhale', 'holdEmpty'] as BreathingStep[]).map((step) => {
            const isActive = session.currentStep === step;
            const isAvailable = (pattern as any)[step] > 0;
            if (!isAvailable) return null;

            return (
              <div 
                key={step} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${
                  isActive 
                    ? 'scale-125 shadow-[0_0_12px_rgba(99,102,241,0.6)] bg-indigo-505' 
                    : (isDark ? 'bg-slate-800' : 'bg-slate-300')
                }`} 
              />
            );
          })}
        </div>
      </main>

      <footer className="w-full flex flex-col gap-4 pb-4 z-10">
        {/* User White Noise Controls - "添加至少3种白噪音，并且可以关闭，由用户选择" */}
        <div className="w-full">
          <p className={`text-center text-[10px] font-bold tracking-widest uppercase mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            背景白噪音伴疗
          </p>
          <div className="flex justify-center gap-1.5 overflow-x-auto pb-1">
            {noiseTracks.map((track) => {
              const isActive = activeNoise === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => setActiveNoise(track.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all duration-300 border shrink-0 ${
                    isActive 
                      ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                      : (isDark 
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                        )
                  }`}
                >
                  {track.icon}
                  <span>{track.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 mt-1">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`flex-[2] py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 active:scale-[0.97] transition-all border backdrop-blur-sm ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/50 text-white shadow-md hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-800 shadow-sm shadow-slate-100/50 hover:bg-slate-50'
            }`}
          >
            {isPaused ? (
              <><Play size={20} fill="currentColor" /> 继续练习</>
            ) : (
              <><Pause size={20} fill="currentColor" /> 暂停练习</>
            )}
          </button>
          <button 
            onClick={onExit}
            className={`flex-1 py-4 rounded-2xl font-medium active:scale-[0.97] transition-all border ${
              isDark 
                ? 'bg-slate-900/40 border-slate-800 text-slate-505 hover:text-slate-400 hover:border-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            结束
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ExerciseScreen;
