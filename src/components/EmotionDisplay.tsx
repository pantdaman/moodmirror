// src/components/EmotionDisplay.tsx

import React from 'react';
import { EmotionData } from '../types';

interface EmotionDisplayProps {
  emotionData: EmotionData | null;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ emotionData }) => {
  if (!emotionData) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Waiting for emotion detection...</p>
      </div>
    );
  }
  
  const { emotion, confidence, timestamp } = emotionData;
  
  // Emotion color mapping
  const emotionColors: Record<string, string> = {
    happy: 'bg-yellow-100 text-yellow-800',
    sad: 'bg-blue-100 text-blue-800',
    angry: 'bg-red-100 text-red-800',
    fearful: 'bg-purple-100 text-purple-800',
    disgusted: 'bg-green-100 text-green-800',
    surprised: 'bg-pink-100 text-pink-800',
    neutral: 'bg-gray-100 text-gray-800'
  };
  
  const colorClass = emotionColors[emotion] || 'bg-gray-100 text-gray-800';
  const timeString = new Date(timestamp).toLocaleTimeString();
  
  return (
    <div className="p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Current Emotion</h3>
        <span className="text-sm text-gray-500">{timeString}</span>
      </div>
      
      <div className={`p-4 rounded-lg ${colorClass} flex items-center justify-between`}>
        <span className="text-xl font-semibold capitalize">{emotion}</span>
        <span className="text-sm font-medium">
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-blue-600" 
            style={{ width: `${Math.round(confidence * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default EmotionDisplay;