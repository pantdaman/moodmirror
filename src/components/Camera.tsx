/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// src/components/Camera.tsx

import React, { useRef, useEffect, useState } from 'react';
import { useEmotionDetection } from '../hooks/useEmotionDetection';
import { EmotionData, Emotion } from '../types';

// Import MediaStream type from lib.dom.d.ts
type MediaStreamType = globalThis.MediaStream;

interface CameraProps {
  onEmotionDetected?: (emotionData: EmotionData) => void;
  detectionFrequency?: number;
  className?: string;
  isCapturing: boolean;
}

// Emotion emoji mapping
const emotionEmojis: Record<Emotion, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲',
  neutral: '😐'
};

const Camera: React.FC<CameraProps> = ({ 
  onEmotionDetected, 
  detectionFrequency = 1000,
  className = '',
  isCapturing
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detectedEmotions, setDetectedEmotions] = useState<Record<Emotion, number>>({
    happy: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    neutral: 0
  });
  const [dominantEmotion, setDominantEmotion] = useState<Emotion | null>(null);
  const { currentEmotion, isModelLoaded, isProcessing, error } = useEmotionDetection(
    videoRef,
    detectionFrequency,
    isCapturing // Only enable detection when capturing
  );
  
  // Start video stream on mount
  useEffect(() => {
    let stream: MediaStreamType | null = null;
    
    async function startVideo() {
      try {
        stream = await window.navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }
    
    startVideo();
    
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Update detected emotions when currentEmotion changes
  useEffect(() => {
    if (currentEmotion && isCapturing) {
      setDetectedEmotions(prevEmotions => ({
        ...prevEmotions,
        [currentEmotion.emotion]: prevEmotions[currentEmotion.emotion] + 1
      }));
      
      // Update dominant emotion
      const allEmotions = Object.entries(detectedEmotions).map(([emotion, count]) => ({
        emotion: emotion as Emotion,
        count
      }));
      
      const maxCount = Math.max(...allEmotions.map(e => e.count));
      const dominant = allEmotions.find(e => e.count === maxCount)?.emotion || null;
      
      setDominantEmotion(dominant);
    }
  }, [currentEmotion, isCapturing, detectedEmotions]);
  
  // Reset emotions when capturing starts
  useEffect(() => {
    if (isCapturing) {
      setDetectedEmotions({
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0,
        neutral: 0
      });
      setDominantEmotion(null);
    }
  }, [isCapturing]);
  
  // Notify parent component when emotion is detected
  useEffect(() => {
    if (currentEmotion && onEmotionDetected) {
      onEmotionDetected(currentEmotion);
    }
  }, [currentEmotion, onEmotionDetected]);
  
  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover rounded-md"
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-80 rounded-md">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}
      
      {!isModelLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 rounded-md">
          <p className="text-gray-700">Loading emotion detection models...</p>
        </div>
      )}
      
      {isProcessing && isCapturing && (
        <div className="absolute top-2 right-2 bg-indigo-600 bg-opacity-75 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          Analyzing
        </div>
      )}
      
      {/* Emotion display */}
      {isCapturing && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3 rounded-b-md">
          <div className="flex justify-between items-center">
            {Object.entries(emotionEmojis).map(([emotion, emoji]) => (
              <div 
                key={emotion} 
                className={`flex flex-col items-center ${dominantEmotion === emotion ? 'scale-110' : ''}`}
              >
                <div className={`text-2xl ${dominantEmotion === emotion ? 'animate-bounce' : ''}`}>
                  {emoji}
                </div>
                <div className={`text-xs mt-1 ${dominantEmotion === emotion ? 'text-white font-bold' : 'text-gray-300'}`}>
                  {emotion}
                </div>
                {detectedEmotions[emotion as Emotion] > 0 && (
                  <div className="text-xs text-white mt-1">
                    {detectedEmotions[emotion as Emotion]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;