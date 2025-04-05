// src/components/Recommendations.tsx

import React from 'react';
import { Recommendation, Emotion } from '../types';

interface RecommendationsProps {
  recommendations: Recommendation[];
  onSelect: (recommendationId: string) => void;
  currentEmotion: Emotion;
}

const Recommendations: React.FC<RecommendationsProps> = ({ 
  recommendations, 
  onSelect,
  currentEmotion
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">No recommendations available for your current mood.</p>
      </div>
    );
  }
  
  // Category icons (simplified with text for now)
  const categoryIcons: Record<string, string> = {
    Mindfulness: '🧠',
    Physical: '🏃‍♂️',
    Relaxation: '😌',
    Productivity: '📝',
    Social: '👥',
    Sensory: '👂',
    Environment: '🌳',
    Creative: '🎨',
    Growth: '🌱'
  };
  
  return (
    <div className="space-y-4">
      <p className="text-gray-700 mb-4">
        Based on your {currentEmotion} mood, here are some activities that might help:
      </p>
      
      {recommendations.map(recommendation => (
        <div 
          key={recommendation.id}
          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onSelect(recommendation.id)}
        >
          <div className="flex items-start">
            <div className="p-2 bg-indigo-100 rounded-full text-xl mr-3">
              {categoryIcons[recommendation.category] || '🔍'}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{recommendation.title}</h3>
                <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {recommendation.duration} min
                </span>
              </div>
              
              <p className="text-gray-600 mt-1">
                {recommendation.description}
              </p>
              
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                  {recommendation.category}
                </span>
                
                <button
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(recommendation.id);
                  }}
                >
                  Try this →
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;