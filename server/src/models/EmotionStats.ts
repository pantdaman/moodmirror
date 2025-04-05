import mongoose from 'mongoose';
import { EmotionType } from '../types';

const emotionStatsSchema = new mongoose.Schema({
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
emotionStatsSchema.index({ userId: 1, timestamp: -1 });
emotionStatsSchema.index({ emotion: 1, timestamp: -1 });

export const EmotionStats = mongoose.model('EmotionStats', emotionStatsSchema); 