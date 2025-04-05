import { EmotionType, EmotionData } from '../types';

// Define the structure for emotion statistics
export interface EmotionStats {
  emotion: EmotionType;
  count: number;
  timestamp: number;
}

// Define the structure for time-based statistics
export interface TimeBasedStats {
  lastHour: Record<EmotionType, number>;
  lastDay: Record<EmotionType, number>;
  lastWeek: Record<EmotionType, number>;
  total: Record<EmotionType, number>;
}

// Storage key for emotion statistics
const STORAGE_KEY = 'emotion_stats';

// Get all emotion statistics from storage
export const getAllEmotionStats = (): EmotionStats[] => {
  try {
    const stats = localStorage.getItem(STORAGE_KEY);
    return stats ? JSON.parse(stats) : [];
  } catch (error) {
    console.error('Error retrieving emotion stats:', error);
    return [];
  }
};

// Save emotion statistics to storage
export const saveEmotionStats = (emotionData: EmotionData): void => {
  try {
    const stats = getAllEmotionStats();
    
    // Add new emotion data
    stats.push({
      emotion: emotionData.emotion as EmotionType,
      count: 1,
      timestamp: Date.now()
    });
    
    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving emotion stats:', error);
  }
};

// Get time-based statistics
export const getTimeBasedStats = (): TimeBasedStats => {
  const stats = getAllEmotionStats();
  const now = Date.now();
  
  // Initialize stats object
  const timeBasedStats: TimeBasedStats = {
    lastHour: {} as Record<EmotionType, number>,
    lastDay: {} as Record<EmotionType, number>,
    lastWeek: {} as Record<EmotionType, number>,
    total: {} as Record<EmotionType, number>
  };
  
  // Initialize all emotion types with 0
  const emotionTypes: EmotionType[] = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'];
  emotionTypes.forEach(emotion => {
    timeBasedStats.lastHour[emotion] = 0;
    timeBasedStats.lastDay[emotion] = 0;
    timeBasedStats.lastWeek[emotion] = 0;
    timeBasedStats.total[emotion] = 0;
  });
  
  // Calculate time-based statistics
  stats.forEach(stat => {
    const emotion = stat.emotion;
    const timestamp = stat.timestamp;
    
    // Update total counts
    timeBasedStats.total[emotion] += stat.count;
    
    // Update time-based counts
    if (now - timestamp <= 60 * 60 * 1000) { // Last hour
      timeBasedStats.lastHour[emotion] += stat.count;
    }
    
    if (now - timestamp <= 24 * 60 * 60 * 1000) { // Last day
      timeBasedStats.lastDay[emotion] += stat.count;
    }
    
    if (now - timestamp <= 7 * 24 * 60 * 60 * 1000) { // Last week
      timeBasedStats.lastWeek[emotion] += stat.count;
    }
  });
  
  return timeBasedStats;
};

// Get percentage distribution of emotions
export const getEmotionPercentages = (timeFrame: 'lastHour' | 'lastDay' | 'lastWeek' | 'total'): Record<EmotionType, number> => {
  const stats = getTimeBasedStats();
  const timeFrameStats = stats[timeFrame];
  
  // Calculate total count for the time frame
  const totalCount = Object.values(timeFrameStats).reduce((sum, count) => sum + count, 0);
  
  // Calculate percentages
  const percentages: Record<EmotionType, number> = {} as Record<EmotionType, number>;
  
  Object.entries(timeFrameStats).forEach(([emotion, count]) => {
    percentages[emotion as EmotionType] = totalCount > 0 ? (count / totalCount) * 100 : 0;
  });
  
  return percentages;
};

// Clear all emotion statistics
export const clearEmotionStats = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing emotion stats:', error);
  }
}; 