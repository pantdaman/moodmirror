// src/pages/History.tsx

import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { EmotionData } from '../types';

const History: React.FC = () => {
  const [emotionHistory] = useLocalStorage<EmotionData[]>('emotion-tracker-history', []);
  
  if (emotionHistory.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Emotion History</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No emotion history available yet.</p>
          <p className="text-gray-500 mt-2">Use the camera to detect emotions and build your history.</p>
        </div>
      </div>
    );
  }
  
  // Group emotions by day
  const groupedByDay = emotionHistory.reduce<Record<string, EmotionData[]>>((acc, emotion) => {
    const date = new Date(emotion.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(emotion);
    return acc;
  }, {});
  
  // Sort days in reverse chronological order
  const sortedDays = Object.keys(groupedByDay).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Emotion History</h1>
      
      {sortedDays.map(day => (
        <div key={day} className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{day}</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="space-y-3">
                {groupedByDay[day].map((emotion, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ 
                        backgroundColor: getEmotionColor(emotion.emotion)
                      }}></div>
                      <span className="font-medium capitalize">{emotion.emotion}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(emotion.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to get color for emotion
function getEmotionColor(emotion: string): string {
  const colorMap: Record<string, string> = {
    happy: '#FBBF24', // yellow
    sad: '#60A5FA', // blue
    angry: '#EF4444', // red
    fearful: '#A78BFA', // purple
    disgusted: '#34D399', // green
    surprised: '#F472B6', // pink
    neutral: '#9CA3AF' // gray
  };
  
  return colorMap[emotion] || '#9CA3AF';
}

export default History;