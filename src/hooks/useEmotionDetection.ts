// src/hooks/useEmotionDetection.ts

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { EmotionType, EmotionData } from '../types';

const MODEL_URL = '/models';

export function useEmotionDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  frequency: number = 1000,
  enabled: boolean = true
) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const processingTimeoutRef = useRef<number | null>(null);
  
  // Load models on mount
  useEffect(() => {
    async function loadModels() {
      try {
        setError(null);
        console.log('Loading emotion detection models...');
        
        // Load models sequentially to better track loading progress
        console.log('Loading face detector model...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        
        console.log('Loading landmark model...');
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        
        console.log('Loading expression model...');
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        
        console.log('All models loaded successfully');
        setIsModelLoaded(true);
      } catch (err) {
        const errorMessage = 'Failed to load emotion detection models. Please check if the models are present in the public/models directory.';
        setError(errorMessage);
        console.error(errorMessage, err);
      }
    }
    
    loadModels();
    
    // Cleanup on unmount
    return () => {
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);
  
  // Process video frames at specified frequency
  useEffect(() => {
    if (!isModelLoaded || !enabled || !videoRef.current) {
      console.log('Skipping frame processing:', {
        isModelLoaded,
        enabled,
        hasVideoRef: !!videoRef.current
      });
      return;
    }
    
    async function processFrame() {
      if (!videoRef.current) {
        console.log('No video element available');
        return;
      }
      
      if (videoRef.current.readyState !== 4) {
        console.log('Video not ready, state:', videoRef.current.readyState);
        processingTimeoutRef.current = window.setTimeout(processFrame, frequency);
        return;
      }
      
      setIsProcessing(true);
      
      try {
        console.log('Processing video frame...');
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
          
        if (detections) {
          const expressions = detections.expressions;
          const emotionEntries = Object.entries(expressions) as [EmotionType, number][];
          
          // Find emotion with highest confidence
          const [dominantEmotion, confidence] = emotionEntries.reduce(
            (prev, current) => (current[1] > prev[1] ? current : prev)
          );
          
          console.log('Detected emotion:', dominantEmotion, 'with confidence:', confidence);
          setCurrentEmotion({
            emotion: dominantEmotion,
            confidence
          });
        } else {
          console.log('No face detected in frame');
        }
      } catch (err) {
        console.error('Error processing frame:', err);
        setError('Error processing video frame. Please try again.');
      } finally {
        setIsProcessing(false);
        // Schedule next frame processing
        processingTimeoutRef.current = window.setTimeout(processFrame, frequency);
      }
    }
    
    processFrame();
    
    return () => {
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [isModelLoaded, videoRef, frequency, enabled]);
  
  return {
    currentEmotion,
    isModelLoaded,
    isProcessing,
    error
  };
}