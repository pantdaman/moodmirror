import { EmotionType, Recommendation } from '../types';

// Define a type for our curated recommendations that includes intensity
interface CuratedRecommendation extends Recommendation {
  intensity: 'low' | 'medium' | 'high';
  emotionTargets?: EmotionType[];
}

// Game recommendations for different emotions
const gameRecommendations: Record<string, Recommendation[]> = {
  happy: [
    {
      id: 'happy-game-1',
      title: 'Color Match Challenge',
      description: 'A quick game to maintain your positive energy and focus.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '1-2 minutes',
      mediaSuggestion: 'https://poki.com/en/g/1010-color-match',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A fun color-matching game that helps maintain positive energy and focus.'
    },
    {
      id: 'happy-game-2',
      title: 'Gratitude Scavenger Hunt',
      description: 'A mindfulness game to appreciate the present moment.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '2-3 minutes',
      mediaSuggestion: 'https://poki.com/en/g/snake-solver',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A hidden object game that can be used as a gratitude scavenger hunt to appreciate the present moment.'
    },
    {
      title: "Joyful Breathing Pattern",
      description: "A breathing exercise that matches your happy mood with uplifting patterns.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Follow this pattern: breathe in for 3, hold for 2, breathe out for 4, hold for 1. As you breathe, imagine your joy expanding with each breath.",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A mindful breathing game that helps you savor and extend your happy feelings."
    }
  ],
  sad: [
    {
      id: 'sad-game-1',
      title: 'Emotion Transformation Game',
      description: 'A word game to practice cognitive reframing.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '2-3 minutes',
      mediaSuggestion: 'https://poki.com/en/g/word-search',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A word search game that can be used to practice cognitive reframing by finding positive words.'
    },
    {
      id: 'sad-game-2',
      title: 'Comfort Object Hunt',
      description: 'An activity to identify sources of comfort.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '1-2 minutes',
      mediaSuggestion: 'https://poki.com/en/g/spot-the-difference',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A spot-the-difference game that can be used to identify sources of comfort in your environment.'
    },
    {
      title: "Gentle Wave Breathing",
      description: "A soothing breathing pattern that mimics gentle ocean waves.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Imagine ocean waves as you breathe: slow inhale (wave coming in), gentle pause (wave at peak), slow exhale (wave going out), brief pause (calm water). Repeat 10 times.",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A calming breathing game that helps soothe sadness through rhythmic, gentle breathing patterns."
    }
  ],
  angry: [
    {
      id: 'angry-game-1',
      title: 'Anger Release Tic-Tac-Toe',
      description: 'A modified version of tic-tac-toe for controlled anger release.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '1-2 minutes',
      mediaSuggestion: 'https://poki.com/en/g/tic-tac-toe',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A classic tic-tac-toe game that can be used for controlled anger release by focusing on strategy.'
    },
    {
      id: 'angry-game-2',
      title: 'Breathing Pattern Game',
      description: 'A counting game disguised as a breathing exercise.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '1-2 minutes',
      mediaSuggestion: 'https://poki.com/en/g/bubble-shooter',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A bubble shooter game that can be used as a breathing exercise by matching your breathing to the bubble movements.'
    },
    {
      title: "Cooling Breath Technique",
      description: "A breathing exercise that helps cool down intense emotions.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Imagine breathing in cool air and exhaling hot air. Inhale through your nose for 4 counts, hold for 2, exhale through your mouth for 6 counts (longer exhale). Repeat 8 times.",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A mindful breathing game that helps reduce the intensity of anger through visualization and controlled breathing."
    }
  ],
  anxious: [
    {
      id: 'anxious-game-1',
      title: '5-4-3-2-1 Grounding Game',
      description: 'A sensory awareness game.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '2-3 minutes',
      mediaSuggestion: 'https://poki.com/en/g/city-car-driving-stunt-master',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A memory game that can be used for the 5-4-3-2-1 grounding technique by focusing on visual patterns.'
    },
    {
      id: 'anxious-game-2',
      title: 'Worry Time Box',
      description: 'A structured activity to contain worries.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '1-2 minutes',
      mediaSuggestion: 'https://poki.com/en/g/tetris',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A Tetris game that can be used to contain worries by focusing on organizing and clearing blocks.'
    },
    {
      title: "Calming Square Breathing",
      description: "A structured breathing pattern that forms a square to reduce anxiety.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Draw a square in the air with your finger: inhale for 4 counts (draw first side), hold for 4 (draw second side), exhale for 4 (draw third side), hold for 4 (draw fourth side). Repeat 5 times.",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A mindful breathing game that helps reduce anxiety through structured, predictable breathing patterns."
    }
  ],
  neutral: [
    {
      id: 'neutral-game-1',
      title: 'Emotion Explorer',
      description: 'A game to understand your current emotions.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '2-3 minutes',
      mediaSuggestion: 'https://poki.com/en/g/2048',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A 2048 game that can be used to explore emotions by observing your reactions to success and failure.'
    },
    {
      id: 'neutral-game-2',
      title: 'Mindful karate-fighter',
      description: 'A combination of strategy and mindfulness practice.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '1-2 minutes',
      mediaSuggestion: 'https://poki.com/en/g/karate-fighter',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A Connect 4 game that can be used for mindfulness practice by focusing on each move.'
    },
    {
      title: "Balanced Breathing Challenge",
      description: "A breathing exercise that helps maintain emotional balance.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Practice equal breathing: inhale for 4, exhale for 4. Count silently as you breathe. Try to maintain the exact same count for each breath. Complete 10 cycles.",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A mindful breathing game that helps maintain emotional balance through equal, measured breathing patterns."
    }
  ],
  fearful: [
    {
      id: 'fearful-game-1',
      title: 'Fear Exposure Game',
      description: 'A controlled exposure game to reduce fear.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '2-3 minutes',
      mediaSuggestion: 'https://poki.com/en/g/maze',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A maze game that can be used for controlled exposure to reduce fear by navigating through challenges.'
    },
    {
      id: 'fearful-game-2',
      title: 'Courage Builder',
      description: 'A game to build courage and resilience.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '1-2 minutes',
      mediaSuggestion: 'https://poki.com/en/g/the-sniper-code',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A platformer game that can be used to build courage and resilience by overcoming obstacles.'
    },
    {
      title: "Courage Building Visualization",
      description: "A guided visualization game to build courage.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Close your eyes and imagine yourself as a superhero. What powers do you have? How do you use them to overcome fear? Draw or write about your superhero self.",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A creative game that helps build courage through positive visualization and role-playing."
    },
    {
      title: "Fear Release Breathing",
      description: "A breathing pattern designed to release fear.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Breathe in deeply for 4 counts, hold for 2, exhale forcefully for 6 counts (like blowing out a candle). As you exhale, imagine your fear leaving your body. Repeat 8 times.",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A mindful breathing game that helps release fear through visualization and controlled breathing patterns."
    }
  ],
  disgusted: [
    {
      id: 'disgusted-game-1',
      title: 'Perspective Shift Game',
      description: 'A game to shift perspective on unpleasant situations.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '2-3 minutes',
      mediaSuggestion: 'https://poki.com/en/g/puzzle',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A puzzle game that can be used to shift perspective on unpleasant situations by focusing on solutions.'
    },
    {
      id: 'disgusted-game-2',
      title: 'Clean Slate Activity',
      description: 'A game to reset and refresh your mindset.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '1-2 minutes',
      mediaSuggestion: 'https://poki.com/en/brain',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A solitaire game that can be used to reset and refresh your mindset by focusing on organizing cards.'
    },
    {
      title: "Fresh Start Visualization",
      description: "A visualization game to shift from disgust to freshness.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Imagine yourself standing under a gentle waterfall of clean, fresh water. Feel it washing away any feelings of disgust. What does the fresh feeling feel like?",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A visualization game that helps transform feelings of disgust through imagery of cleanliness and freshness."
    },
    {
      title: "Cleansing Breath Pattern",
      description: "A breathing exercise to cleanse negative feelings.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Breathe in fresh air through your nose for 3 counts, hold for 2, exhale through your mouth for 5 counts (like fogging a mirror). Imagine exhaling all negative feelings. Repeat 10 times.",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A mindful breathing game that helps cleanse feelings of disgust through visualization and controlled breathing."
    }
  ],
  surprised: [
    {
      id: 'surprised-game-1',
      title: 'Curiosity Explorer',
      description: 'A game to channel surprise into curiosity.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '2-3 minutes',
      mediaSuggestion: 'https://poki.com/en/brain',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'An adventure game that can be used to channel surprise into curiosity by exploring new environments.'
    },
    {
      id: 'surprised-game-2',
      title: 'Adaptability Challenge',
      description: 'A game to practice adapting to unexpected situations.',
      source: 'Poki.com',
      mediaType: 'activity',
      duration: '1-2 minutes',
      mediaSuggestion: 'https://poki.com/en/brain',
      isAIGenerated: false,
      contentType: 'game',
      contentContext: 'A strategy game that can be used to practice adapting to unexpected situations.'
    },
    {
      title: "Centering Breath",
      description: "A breathing exercise to help process surprise.",
      source: "Emotions Tracker",
      mediaType: "activity",
      duration: "5 minutes",
      mediaSuggestion: "Place one hand on your chest and one on your belly. Breathe in for 4 counts, feeling your chest and belly expand. Hold for 2, then exhale for 6 counts, feeling everything settle. Repeat 8 times.",
      isAIGenerated: false,
      contentType: "game",
      contentContext: "A mindful breathing game that helps process feelings of surprise through body awareness and controlled breathing."
    }
  ]
};

// Regular curated recommendations
const curatedRecommendations: CuratedRecommendation[] = [
  {
    id: 'curated-1',
    title: 'Mindful Breathing Exercise',
    description: 'A simple breathing exercise to help you center yourself and reduce stress.',
    source: 'Youtube App',
    mediaType: 'audio',
    duration: '5 minutes',
    mediaSuggestion: 'https://www.youtube.com/watch?v=wfDTp2GogaQ&t=4s',
    isAIGenerated: false,
    contentType: 'general',
    contentContext: 'This guided meditation focuses on the breath as an anchor to the present moment.',
    intensity: 'low',
    emotionTargets: ['neutral', 'fearful'] // Only show for these emotions
  }
];

// Function to get recommendations by emotion
export const getRecommendationsByEmotion = (emotion: EmotionType): CuratedRecommendation[] => {
  // Get regular recommendations for this emotion
  const regularRecommendations = curatedRecommendations.filter(
    rec => rec.contentType === 'general' && 
    rec.emotionTargets && 
    rec.emotionTargets.includes(emotion)
  );
  
  // Get game recommendations for this emotion
  const emotionGames = gameRecommendations[emotion] || [];
  
  // Convert game recommendations to CuratedRecommendation type
  const gameRecommendationsWithIntensity = emotionGames.map(game => ({
    ...game,
    intensity: 'medium' as const,
    // Ensure all required properties are present
    id: game.id || `game-${Math.random().toString(36).substring(2, 9)}`,
    mediaType: game.mediaType || 'activity',
    contentType: game.contentType || 'game'
  }));
  
  // Combine and return all recommendations
  return [...regularRecommendations, ...gameRecommendationsWithIntensity];
}; 