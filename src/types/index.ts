// src/types/index.ts

export type EmotionType = 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'neutral';

export interface EmotionData {
  emotion: string;
  confidence: number;
}

export type MediaType = 'none' | 'music' | 'video' | 'game' | 'joke';

export interface Recommendation {
  id?: string;
  title: string;
  description: string;
  source: string;
  mediaType: 'audio' | 'video' | 'text' | 'activity';
  duration?: string;
  mediaSuggestion?: string;
  isAIGenerated: boolean;
  youtubeLink?: string;
  contentType?: 'speech' | 'movie-clip' | 'sports' | 'general' | 'game';
  contentContext?: string;
}

export interface FeedbackData {
  recommendationId: string;
  emotionBefore: EmotionType;
  emotionAfter?: EmotionType;
  rating: 1 | 2 | 3 | 4 | 5;
  timestamp: number;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  cameraPermission: boolean;
  emotionDetectionFrequency: number; // in milliseconds
  storagePolicy: 'session' | 'persistent';
  theme: 'light' | 'dark' | 'system';
}