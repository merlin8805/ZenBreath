
import { BreathingPattern } from './types';

export const PRESETS: BreathingPattern[] = [
  {
    id: 'box',
    name: '盒式呼吸 (4-4-4-4)',
    description: '海军陆战队常用，快速缓解焦虑，提高专注力。',
    inhale: 4,
    holdFull: 4,
    exhale: 4,
    holdEmpty: 4,
  },
  {
    id: 'equal',
    name: '等量呼吸 (4-4)',
    description: '基础平衡呼吸，适合在日常生活中随时随地练习。',
    inhale: 4,
    holdFull: 0,
    exhale: 4,
    holdEmpty: 0,
  },
  {
    id: 'long',
    name: '长呼吸 (4-8)',
    description: '激活副交感神经，帮助入睡和深度放松。',
    inhale: 4,
    holdFull: 0,
    exhale: 8,
    holdEmpty: 0,
  },
  {
    id: 'relax-478',
    name: '4-7-8 呼吸',
    description: '著名的助眠呼吸法，通过屏息调节神经系统。',
    inhale: 4,
    holdFull: 7,
    exhale: 8,
    holdEmpty: 0,
  },
];
