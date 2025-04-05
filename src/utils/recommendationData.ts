// src/utils/recommendationData.ts

import { Recommendation } from '../types';

export const recommendations: Recommendation[] = [
  // Happy recommendations
  {
    id: 'happy-1',
    title: 'Capitalize on Positive Energy',
    description: 'Use this positive mood to tackle a challenging task youve been putting off. Your good mood will help you approach it with optimism.',
    category: 'Productivity',
    emotionTargets: ['happy'],
    duration: 20
  },
  {
    id: 'happy-2',
    title: 'Spread the Joy',
    description: 'Share your positive emotions with someone else. Send a message to a friend or family member telling them why you appreciate them.',
    category: 'Social',
    emotionTargets: ['happy'],
    duration: 5
  },
  
  // Sad recommendations
  {
    id: 'sad-1',
    title: 'Gentle Movement',
    description: 'Take a 10-minute walk, preferably outside. Physical movement and nature can help shift your mood.',
    category: 'Physical',
    emotionTargets: ['sad'],
    duration: 10
  },
  {
    id: 'sad-2',
    title: 'Soothing Playlist',
    description: 'Listen to music that acknowledges your feelings but gradually shifts to more uplifting tones.',
    category: 'Sensory',
    emotionTargets: ['sad'],
    duration: 15
  },
  {
    id: 'sad-3',
    title: 'Expressive Writing',
    description: 'Take 5 minutes to write down your feelings without judging them. Sometimes acknowledging emotions helps process them.',
    category: 'Mindfulness',
    emotionTargets: ['sad'],
    duration: 5
  },
  
  // Angry recommendations
  {
    id: 'angry-1',
    title: 'Cool Down Breathing',
    description: 'Try the 4-7-8 technique: Inhale for 4 counts, hold for 7, exhale for 8. Repeat 4 times.',
    category: 'Relaxation',
    emotionTargets: ['angry'],
    duration: 3
  },
  {
    id: 'angry-2',
    title: 'Physical Release',
    description: 'Channel the energy into a quick burst of exercise - jumping jacks, push-ups, or a brisk walk.',
    category: 'Physical',
    emotionTargets: ['angry'],
    duration: 5
  },
  
  // Fearful recommendations
  {
    id: 'fearful-1',
    title: 'Grounding Exercise',
    description: 'Practice the 5-4-3-2-1 technique: Name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste.',
    category: 'Mindfulness',
    emotionTargets: ['fearful'],
    duration: 5
  },
  {
    id: 'fearful-2',
    title: 'Progressive Relaxation',
    description: 'Tense and then release each muscle group in your body, starting from your toes and moving upward.',
    category: 'Relaxation',
    emotionTargets: ['fearful'],
    duration: 8
  },
  
  // Neutral recommendations
  {
    id: 'neutral-1',
    title: 'Mindful Moment',
    description: 'Take advantage of this balanced state to practice 2 minutes of mindful breathing.',
    category: 'Mindfulness',
    emotionTargets: ['neutral'],
    duration: 2
  },
  {
    id: 'neutral-2',
    title: 'Goal Setting',
    description: 'Use this emotionally balanced state to review or set goals for the day or week.',
    category: 'Productivity',
    emotionTargets: ['neutral', 'happy'],
    duration: 10
  }
];