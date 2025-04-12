export type EmotionType = 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'neutral';

export interface EmotionData {
  emotion: string;
  confidence: number;
  intensity?: number;
  note?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'activity' | 'resource' | 'tip';
  emotion: EmotionType;
  isAIGenerated?: boolean;
} 