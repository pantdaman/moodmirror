// src/hooks/useRecommendations.ts

import { useState, useEffect } from 'react';
import { Emotion, EmotionData, Recommendation, FeedbackData } from '../types';
import { recommendations } from '../utils/recommendationData';
import { useLocalStorage } from './useLocalStorage';

export function useRecommendations() {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [suggestedRecommendations, setSuggestedRecommendations] = useState<Recommendation[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useLocalStorage<FeedbackData[]>('emotion-tracker-feedback', []);

  // Update recommendations when emotion changes
  useEffect(() => {
    if (!currentEmotion) return;
    
    // Get recommendations for the current emotion
    const emotionRecommendations = recommendations.filter(rec => 
      rec.emotionTargets.includes(currentEmotion.emotion)
    );
    
    // If we have feedback history, use it to personalize recommendations
    if (feedbackHistory.length > 0) {
      // Sort recommendations by effectiveness based on previous feedback
      const sortedRecommendations = [...emotionRecommendations].sort((a, b) => {
        const aRatings = feedbackHistory
          .filter(f => f.recommendationId === a.id)
          .map(f => f.rating);
          
        const bRatings = feedbackHistory
          .filter(f => f.recommendationId === b.id)
          .map(f => f.rating);
        
        const aAvg = aRatings.length ? aRatings.reduce((sum, r) => sum + r, 0) / aRatings.length : 0;
        const bAvg = bRatings.length ? bRatings.reduce((sum, r) => sum + r, 0) / bRatings.length : 0;
        
        return bAvg - aAvg; // Descending order
      });
      
      setSuggestedRecommendations(sortedRecommendations);
    } else {
      // No feedback history, just randomize the recommendations
      setSuggestedRecommendations(shuffleArray(emotionRecommendations));
    }
  }, [currentEmotion, feedbackHistory]);
  
  // Add feedback for a recommendation
  const addFeedback = (recommendationId: string, rating: 1 | 2 | 3 | 4 | 5, emotionAfter?: Emotion) => {
    if (!currentEmotion) return;
    
    const newFeedback: FeedbackData = {
      recommendationId,
      emotionBefore: currentEmotion.emotion,
      emotionAfter,
      rating,
      timestamp: Date.now()
    };
    
    setFeedbackHistory([...feedbackHistory, newFeedback]);
  };
  
  // Helper function to shuffle an array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  return {
    currentEmotion,
    setCurrentEmotion,
    suggestedRecommendations,
    addFeedback,
    feedbackHistory
  };
}