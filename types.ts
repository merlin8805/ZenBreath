
export type BreathingStep = 'inhale' | 'holdFull' | 'exhale' | 'holdEmpty';

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;    // seconds
  holdFull: number;  // seconds
  exhale: number;    // seconds
  holdEmpty: number; // seconds
}

export interface SessionState {
  isActive: boolean;
  currentStep: BreathingStep;
  remainingSeconds: number;
  totalElapsed: number;
}
