// src/pages/Dashboard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotionDetection } from '../hooks/useEmotionDetection';
import { useGeminiRecommendations } from '../hooks/useGeminiRecommendations';
import { getRecommendationsByEmotion } from '../data/curatedRecommendations';
import { EmotionType, Recommendation, EmotionData } from '../types';
import { RecommendationCard } from '../components/RecommendationCard';
import { Button, Container, Typography, Box, CircularProgress, Paper, Link, Dialog, DialogTitle, DialogContent, DialogActions, Collapse, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { saveEmotionStats } from '../services/emotionStatsService';
import EmotionStats from '../components/EmotionStats';
import logo from '../assets/images/moodmirror-logo.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BarChartIcon from '@mui/icons-material/BarChart';

// Styled components
const EmotionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#f0f2f5',
    border: '1px solid #d0d0d0',
    color: '#333333',
  }
}));

const EmotionTitle = styled(Typography)(({ theme }) => ({
  color: '#4A4A4A',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  '@media (prefers-color-scheme: dark)': {
    color: '#333333',
  }
}));

const EmotionDescription = styled(Typography)(({ theme }) => ({
  color: '#4A4A4A',
  marginBottom: theme.spacing(2),
  '@media (prefers-color-scheme: dark)': {
    color: '#555555',
  }
}));

const EmotionIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

// Add theme object with customColors
const theme = {
  customColors: {
    primary: '#3f51b5',
    secondary: '#f50057',
    accent: '#ff9800',
    background: '#ffffff',
    text: '#4A4A4A',
    border: '#e0e0e0',
    shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }
};

// Add emotion to emoji mapping
const emotionToEmoji: Record<EmotionType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲',
  neutral: '😐'
};

// Add encouraging messages for each emotion
const emotionMessages: Record<EmotionType, string> = {
  happy: "It's wonderful to feel happy! Enjoy this positive moment.",
  sad: "It's okay to feel sad. Your emotions are valid and will pass.",
  angry: "It's normal to feel angry sometimes. Take a deep breath and give yourself a moment.",
  fearful: "It's okay to feel afraid. Remember that you are safe and this feeling will pass.",
  disgusted: "It's okay to feel disgusted. Your body is telling you something important.",
  surprised: "Surprise can be exciting! Embrace the unexpected.",
  neutral: "A neutral mood is perfectly fine. It's a moment of balance."
};

// Add usage tracking constants
const FREE_USAGE_LIMIT = 3;
const USAGE_COUNT_KEY = 'moodMirror_usageCount';
const LAST_USAGE_TIME_KEY = 'moodMirror_lastUsageTime';
const USAGE_RESET_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

// Add a styled button component
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  }
}));

// Add a styled emotion card component
const EmotionCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e0e0e0',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#f0f2f5',
    border: '1px solid #d0d0d0',
  }
}));

// Add a PremiumDialog component
const PremiumDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle sx={{ textAlign: 'center', color: 'primary.main' }}>
      Free Usage Limit Reached
    </DialogTitle>
    <DialogContent>
      <Box sx={{ textAlign: 'center', my: 2 }}>
        <Typography variant="h6" gutterBottom>
          You've reached your free usage limit
        </Typography>
        <Typography paragraph>
          You've used MoodMirror {FREE_USAGE_LIMIT} times today. Please try again in 1 hour.
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 3,
          p: 3,
          backgroundColor: 'rgba(63, 81, 181, 0.05)',
          borderRadius: 2
        }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We're working on premium features for unlimited access. Stay tuned!
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            In the meantime, take a break and come back later to continue tracking your emotions.
          </Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

// Add a compact EmotionStats component
const CompactEmotionStats = () => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <EmotionContainer sx={{ mb: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: expanded ? 2 : 0,
        color: '#4A4A4A',
        '@media (prefers-color-scheme: dark)': {
          color: '#333333',
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" sx={{
            color: 'inherit',
            '@media (prefers-color-scheme: dark)': {
              color: '#333333',
            }
          }}>
            📊 Emotion Statistics
          </Typography>
        </Box>
        <Button 
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{ 
            minWidth: 'auto', 
            p: 1,
            color: '#4A4A4A',
            '@media (prefers-color-scheme: dark)': {
              color: '#333333',
            }
          }}
        >
          {expanded ? '▼ Hide' : '▲ Show'}
        </Button>
      </Box>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ 
          maxHeight: isMobile ? '200px' : '300px', 
          overflow: 'auto',
          pr: 1,
          color: '#4A4A4A',
          '@media (prefers-color-scheme: dark)': {
            color: '#333333',
          }
        }}>
          <EmotionStats />
        </Box>
      </Collapse>
    </EmotionContainer>
  );
};

// Add emotion emojis for the logo decoration
const emotionEmojis = ['😊', '😌', '😔', '😤', '😡', '😨', '😴'];

// Add emojis for the MoodMirror text
const moodEmojis = ['😊', '😌', '😔', '😤', '��', '😨', '😴'];

// Function to calculate emoji positions in a circle around the logo
const getEmojiPosition = (index: number, total: number) => {
  const radius =35; // Distance from the center of the logo
  const angle = (index / total) * 2 * Math.PI; // Distribute emojis evenly in a circle
  
  return {
    left: `calc(50% + ${radius * Math.cos(angle)}px)`,
    top: `calc(50% + ${radius * Math.sin(angle)}px)`,
    transform: 'translate(-50%, -50%)',
  };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [showEmotionResult, setShowEmotionResult] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const captureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDetectedEmotionRef = useRef<EmotionData | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [forceRefresh, setForceRefresh] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [usageCount, setUsageCount] = useState(() => {
    const savedCount = localStorage.getItem(USAGE_COUNT_KEY);
    return savedCount ? parseInt(savedCount, 10) : 0;
  });
  const [lastUsageTime, setLastUsageTime] = useState(() => {
    const savedTime = localStorage.getItem(LAST_USAGE_TIME_KEY);
    return savedTime ? parseInt(savedTime, 10) : 0;
  });
  const [canUseApp, setCanUseApp] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { currentEmotion, isModelLoaded, isProcessing, error } = useEmotionDetection(
    videoRef,
    1000, // Process every second
    isCapturing // Only process when capturing
  );

  const { recommendations: aiRecommendations, isLoading: isLoadingRecommendations, error: recommendationError } = useGeminiRecommendations(emotionData, forceRefresh);

  useEffect(() => {
    if (currentEmotion) {
      // Store the emotion but don't display it yet
      lastDetectedEmotionRef.current = currentEmotion;
    }
  }, [currentEmotion]);

  // Check if user can use the app based on time since last use
  useEffect(() => {
    const checkUsageTime = () => {
      const now = Date.now();
      const timeSinceLastUse = now - lastUsageTime;
      
      // If it's been more than 1 hour since last use, reset the usage count
      if (timeSinceLastUse > USAGE_RESET_INTERVAL) {
        setUsageCount(0);
        localStorage.setItem(USAGE_COUNT_KEY, '0');
        setCanUseApp(true);
      } else if (usageCount >= FREE_USAGE_LIMIT) {
        setCanUseApp(false);
      } else {
        setCanUseApp(true);
      }
    };
    
    checkUsageTime();
    // Check every minute
    const interval = setInterval(checkUsageTime, 60000);
    
    return () => clearInterval(interval);
  }, [lastUsageTime, usageCount]);

  const handleStartCapture = async () => {
    try {
      // Reset states
      setDetectedEmotion(null);
      setShowEmotionResult(false);
      setShowConfirmButton(false);
      setCapturedImage(null);
      lastDetectedEmotionRef.current = null;
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Ensure we're using the front camera
        } 
      });
      
      // Set the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays
        await videoRef.current.play();
      }
      
      setIsCapturing(true);
      
      // Set a timeout to stop capturing after 10 seconds
      captureTimeoutRef.current = setTimeout(() => {
        handleStopCapture();
      }, 10000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Show error message to user
      alert('Could not access camera. Please make sure your camera is connected and you have granted permission to use it.');
    }
  };

  const handleStopCapture = () => {
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
    
    // Capture the current video frame before stopping the stream
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL and store it
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
      }
    }
    
    // Don't stop the video stream, just set isCapturing to false
    setIsCapturing(false);
    
    // Show the detected emotion after stopping capture
    if (lastDetectedEmotionRef.current) {
      setDetectedEmotion(lastDetectedEmotionRef.current.emotion as EmotionType);
      setShowConfirmButton(true);
    }
  };

  const handleConfirmEmotion = () => {
    if (!detectedEmotion) return;
    
    // Increment usage count
    const newUsageCount = usageCount + 1;
    setUsageCount(newUsageCount);
    localStorage.setItem(USAGE_COUNT_KEY, newUsageCount.toString());
    
    // Update last usage time
    const now = Date.now();
    setLastUsageTime(now);
    localStorage.setItem(LAST_USAGE_TIME_KEY, now.toString());
    
    // Check if user has reached the free usage limit
    if (newUsageCount >= FREE_USAGE_LIMIT) {
      setShowPremiumDialog(true);
      setCanUseApp(false);
    }

    try {
      // Save emotion data for statistics
      saveEmotionStats({
        emotion: detectedEmotion as EmotionType,
        confidence: 1.0
      });

      // Set the emotion data for the recommendation engine
      setEmotionData({
        emotion: detectedEmotion,
        confidence: 1.0 // Since this is a confirmed emotion
      });

      // Show emotion result and recommendations
      setShowEmotionResult(true);
      setShowRecommendations(true);

      // Get curated recommendations immediately
      const curatedRecommendations = getRecommendationsByEmotion(detectedEmotion);
      setRecommendations(curatedRecommendations);
    } catch (error) {
      console.error('Error confirming emotion:', error);
      alert('Failed to save emotion data. Please try again.');
    }
  };

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('user');
    // Navigate to login page
    navigate('/login');
  };

  // Update recommendations when aiRecommendations change
  useEffect(() => {
    if (aiRecommendations.length > 0) {
      console.log('AI recommendations updated:', aiRecommendations);
      
      // Get curated recommendations
      const curatedRecommendations = getRecommendationsByEmotion(detectedEmotion as EmotionType);
      
      // Combine recommendations, prioritizing AI-generated ones first
      const combinedRecommendations = [...aiRecommendations, ...curatedRecommendations];
      console.log('Combined recommendations:', combinedRecommendations);
      
      setRecommendations(combinedRecommendations);
    }
  }, [aiRecommendations, detectedEmotion]);

  // Add a console log to debug the emotionData state
  useEffect(() => {
    console.log('emotionData changed:', emotionData);
  }, [emotionData]);

  // Add a console log to debug the recommendations state
  useEffect(() => {
    console.log('recommendations changed:', recommendations);
  }, [recommendations]);

  // Add a function to handle refreshing recommendations
  const handleRefreshRecommendations = () => {
    setForceRefresh(prev => !prev);
  };

  // Update the usage count indicator to show time remaining
  const getTimeRemaining = () => {
    if (canUseApp) {
      return `${FREE_USAGE_LIMIT - usageCount} free uses remaining`;
    } else {
      const now = Date.now();
      const timeSinceLastUse = now - lastUsageTime;
      const timeRemaining = USAGE_RESET_INTERVAL - timeSinceLastUse;
      
      if (timeRemaining <= 0) {
        return `${FREE_USAGE_LIMIT} free uses available`;
      }
      
      const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));
      return `Try again in ${minutesRemaining} minutes`;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ 
      py: 4,
      color: '#4A4A4A',
      backgroundColor: '#ffffff',
      '@media (prefers-color-scheme: dark)': {
        color: '#333333',
        backgroundColor: '#e8eaed',
      }
    }}>
      {/* Header with app name and usage count */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        color: 'inherit'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            position: 'relative',
            width: 80,
            height: 80,
            mr: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Main logo - centered in the container */}
            <Box
              component="img"
              src={logo}
              alt="MoodMirror Logo"
              sx={{
                width: '90%',
                height: '60%',
                position: 'absolute',
                top: '60%',
                left: '70%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
              }}
            />
            {/* Emotion emojis around the logo */}
            {emotionEmojis.map((emoji, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`,
                  ...getEmojiPosition(index, emotionEmojis.length),
                }}
              >
                {emoji}
              </Box>
            ))}
          </Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold', 
            color: '#3f51b5',
            '@media (prefers-color-scheme: dark)': {
              color: '#3f51b5',
            }
          }}>
            MoodMirror
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <Typography variant="body1" sx={{
            color: '#666666',
            fontWeight: 500,
            '@media (prefers-color-scheme: dark)': {
              color: '#555555',
            }
          }}>
            {getTimeRemaining()}
          </Typography>
        </Box>
      </Box>
      
      {/* App description */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        maxWidth: '600px',
        mx: 'auto',
        color: '#666666',
        '@media (prefers-color-scheme: dark)': {
          color: '#555555',
        }
      }}>
        <Typography variant="body2">
          MoodMirror helps you track and understand your emotions through facial recognition. 
          Capture your current mood and receive personalized recommendations to improve your emotional well-being.
        </Typography>
      </Box>
      
      {/* Add keyframes for floating animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-5px) rotate(5deg);
            }
          }
        `}
      </style>
      
      {/* Main content area with tabs for mobile */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left column - Camera and Emotion Detection */}
        <Box sx={{ flex: 1 }}>
          <EmotionContainer>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {/* Always show the video element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ 
                  width: '100%', 
                  maxWidth: '500px', 
                  borderRadius: '8px',
                  transform: 'scaleX(-1)', // Mirror the video for a more natural selfie view
                  display: isCapturing ? 'block' : 'none' // Hide when not capturing
                }}
              />
              
              {/* Show captured image when available and not capturing */}
              {!isCapturing && capturedImage && (
                <img 
                  src={capturedImage} 
                  alt="Captured emotion" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '500px', 
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }} 
                />
              )}
              
              {/* Show placeholder when no video or captured image */}
              {!isCapturing && !capturedImage && (
                <Box 
                  sx={{ 
                    width: '100%', 
                    maxWidth: '500px', 
                    height: '300px', 
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {isModelLoaded ? 'Camera feed will appear here' : 'Loading emotion detection models...'}
                  </Typography>
                </Box>
              )}
              
              {/* Hidden canvas for capturing video frames */}
              <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }} 
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              {!isCapturing ? (
                <StyledButton
                  variant="contained"
                  onClick={handleStartCapture}
                  disabled={!isModelLoaded || !canUseApp}
                  sx={{ 
                    backgroundColor: '#3f51b5',
                    '&:hover': {
                      backgroundColor: '#303f9f',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(63, 81, 181, 0.5)',
                    }
                  }}
                >
                  {!canUseApp ? 'Usage Limit Reached' : isModelLoaded ? 'Start Capturing' : 'Loading Models...'}
                </StyledButton>
              ) : (
                <StyledButton
                  variant="outlined"
                  onClick={handleStopCapture}
                  sx={{ 
                    color: '#3f51b5',
                    borderColor: '#3f51b5',
                    '&:hover': {
                      borderColor: '#3f51b5',
                      backgroundColor: 'rgba(63, 81, 181, 0.1)'
                    }
                  }}
                >
                  Stop Capturing
                </StyledButton>
              )}
            </Box>

            {detectedEmotion && (
              <EmotionCard>
                <Box sx={{ 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 2,
                    mb: 1
                  }}>
                    <Box sx={{
                      backgroundColor: 'rgba(63, 81, 181, 0.1)',
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      <EmotionIcon sx={{ fontSize: '2.5rem', margin: 0 }}>
                        {emotionToEmoji[detectedEmotion]}
                      </EmotionIcon>
                    </Box>
                    <EmotionTitle variant="h5" sx={{ margin: 0 }}>
                      {detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)}
                    </EmotionTitle>
                  </Box>
                  
                  <Box sx={{
                    backgroundColor: 'rgba(63, 81, 181, 0.05)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    mb: 1
                  }}>
                    <EmotionDescription sx={{ mb: 0 }}>
                      {currentEmotion && `Confidence: ${(currentEmotion.confidence * 100).toFixed(1)}%`}
                    </EmotionDescription>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontStyle: 'italic', 
                      color: '#666666',
                      maxWidth: '80%',
                      mb: 2,
                      padding: '12px',
                      backgroundColor: 'rgba(63, 81, 181, 0.05)',
                      borderRadius: '8px',
                      '@media (prefers-color-scheme: dark)': {
                        color: '#555555',
                      }
                    }}
                  >
                    {emotionMessages[detectedEmotion]}
                  </Typography>
                  
                  {showConfirmButton && (
                    <StyledButton
                      variant="contained"
                      onClick={handleConfirmEmotion}
                      sx={{ 
                        mt: 1,
                        backgroundColor: '#3f51b5',
                        '&:hover': {
                          backgroundColor: '#303f9f',
                        }
                      }}
                    >
                      Confirm Emotion
                    </StyledButton>
                  )}
                </Box>
              </EmotionCard>
            )}
          </EmotionContainer>
          
          {/* Compact Emotion Statistics - Show immediately after emotion detection */}
          {detectedEmotion && <CompactEmotionStats />}
        </Box>

        {/* Right column - Recommendations */}
        <Box sx={{ flex: 1 }}>
          <EmotionContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <EmotionTitle variant="h5">
                Recommendations
              </EmotionTitle>
              {showEmotionResult && (
                <StyledButton
                  variant="outlined"
                  onClick={handleRefreshRecommendations}
                  disabled={isLoadingRecommendations}
                  size="small"
                  title="Get a new AI-generated recommendation for the same emotion"
                  sx={{ 
                    color: '#3f51b5',
                    borderColor: '#3f51b5',
                    '&:hover': {
                      borderColor: '#3f51b5',
                      backgroundColor: 'rgba(63, 81, 181, 0.1)'
                    }
                  }}
                >
                  {isLoadingRecommendations ? 'Loading...' : 'Get New AI Suggestion'}
                </StyledButton>
              )}
            </Box>
            
            {isLoading || isLoadingRecommendations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : recommendations.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Show AI recommendations first with a label */}
                {recommendations.filter(rec => rec.isAIGenerated).length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1, mb: 1 }}>
                      AI-Generated Recommendations
                    </Typography>
                    {recommendations
                      .filter(rec => rec.isAIGenerated)
                      .map((recommendation, index) => (
                        <RecommendationCard 
                          key={`ai-${index}`} 
                          recommendation={recommendation}
                        />
                      ))
                    }
                  </>
                )}
                
                {/* Show curated recommendations with a label */}
                {recommendations.filter(rec => !rec.isAIGenerated).length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1, mb: 1 }}>
                      Curated Recommendations
                    </Typography>
                    {recommendations
                      .filter(rec => !rec.isAIGenerated)
                      .map((recommendation, index) => (
                        <RecommendationCard 
                          key={`curated-${index}`} 
                          recommendation={recommendation}
                        />
                      ))
                    }
                  </>
                )}
              </Box>
            ) : (
              <Typography sx={{ textAlign: 'center' }}>
                {detectedEmotion 
                  ? 'Click "Confirm Emotion" to get recommendations' 
                  : 'Detect an emotion to get recommendations'}
              </Typography>
            )}
          </EmotionContainer>
        </Box>
      </Box>

      {/* Add a privacy policy link in the footer */}
      <Box sx={{ mt: 3, textAlign: 'center', pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} MoodMirror. All rights reserved.
        </Typography>
        <Link 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            setShowPrivacyPolicy(true);
          }}
          sx={{ 
            display: 'inline-block', 
            mt: 1, 
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Privacy Policy
        </Link>
      </Box>

      {/* Privacy Policy Dialog */}
      <Dialog
        open={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Data Collection and Usage
          </Typography>
          <Typography paragraph>
            Our emotion tracker app uses facial recognition technology to detect emotions in real-time. We want to be transparent about how we handle your data:
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Facial Images
          </Typography>
          <Typography paragraph>
            • We do not store any facial images or video footage. All image processing happens locally in your browser.
          </Typography>
          <Typography paragraph>
            • The camera feed is only used for real-time emotion detection and is not recorded or transmitted to any server.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Emotion Data
          </Typography>
          <Typography paragraph>
            • We store only the detected emotions and their timestamps locally on your device.
          </Typography>
          <Typography paragraph>
            • This data is used to generate statistics and recommendations, and is not shared with any third parties.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            AI Recommendations
          </Typography>
          <Typography paragraph>
            • When you request AI recommendations, we send only the emotion type (not images) to our AI service.
          </Typography>
          <Typography paragraph>
            • These requests are anonymous and do not include any personally identifiable information.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Data Storage
          </Typography>
          <Typography paragraph>
            • All your emotion data is stored locally on your device using your browser's local storage.
          </Typography>
          <Typography paragraph>
            • You can clear this data at any time by clearing your browser's local storage for this site.
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Third-Party Services
          </Typography>
          <Typography paragraph>
            • We use Google's Gemini AI service for generating recommendations.
          </Typography>
          <Typography paragraph>
            • We do not share any personal data with this service beyond the emotion type.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPrivacyPolicy(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Premium Dialog */}
      <PremiumDialog 
        open={showPremiumDialog} 
        onClose={() => setShowPremiumDialog(false)} 
      />
    </Container>
  );
};

export default Dashboard;