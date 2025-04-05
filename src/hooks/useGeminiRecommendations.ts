import { useState, useEffect, useRef } from 'react';
import { EmotionData, Recommendation, EmotionType } from '../types';
import { generateRecommendation } from '../services/geminiService';
import { getRecommendationsByEmotion } from '../data/curatedRecommendations';

export const useGeminiRecommendations = (emotionData: EmotionData | null, forceRefresh = false) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processedEmotionRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('useGeminiRecommendations hook called with emotionData:', emotionData, 'forceRefresh:', forceRefresh);
    
    const loadRecommendations = async () => {
      if (!emotionData) {
        console.log('No emotion data provided to useGeminiRecommendations');
        return;
      }

      // Check if we've already processed this emotion
      const emotionKey = `${emotionData.emotion}-${emotionData.confidence}`;
      if (processedEmotionRef.current === emotionKey && !forceRefresh) {
        console.log('Already processed this emotion, skipping:', emotionKey);
        return;
      }

      console.log('Loading recommendations for emotion:', emotionData);
      setIsLoading(true);
      setError(null);

      try {
        // Generate AI recommendation
        console.log('Generating AI recommendation...');
        const aiRecommendation = await generateRecommendation(emotionData, forceRefresh);
        console.log('AI recommendation generated:', aiRecommendation);
        
        // Only return the AI recommendation, not the curated ones
        // The Dashboard component will handle combining them
        setRecommendations([aiRecommendation]);
        
        // Mark this emotion as processed
        processedEmotionRef.current = emotionKey;
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError('Failed to load recommendations. Please try again.');
        
        // If AI fails, return an empty array
        // The Dashboard component will handle showing curated recommendations
        setRecommendations([]);
        
        // Mark this emotion as processed even if there was an error
        processedEmotionRef.current = emotionKey;
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [emotionData, forceRefresh]);

  const clearRecommendations = () => {
    console.log('Clearing recommendations');
    setRecommendations([]);
    processedEmotionRef.current = null;
  };

  return {
    recommendations,
    isLoading,
    error,
    clearRecommendations
  };
}; 