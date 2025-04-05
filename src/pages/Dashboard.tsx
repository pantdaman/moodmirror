// src/pages/Dashboard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmotionDetection } from '../hooks/useEmotionDetection';
import { useGeminiRecommendations } from '../hooks/useGeminiRecommendations';
import { getRecommendationsByEmotion } from '../data/curatedRecommendations';
import { EmotionType, Recommendation, EmotionData } from '../types';
import { RecommendationCard } from '../components/RecommendationCard';
import { Button, Container, Typography, Box, CircularProgress, Paper, Link, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { saveEmotionStats } from '../services/emotionStatsService';
import EmotionStats from '../components/EmotionStats';

// Styled components
const EmotionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
}));

const EmotionTitle = styled(Typography)(({ theme }) => ({
  color: '#4A4A4A',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const EmotionDescription = styled(Typography)(({ theme }) => ({
  color: '#4A4A4A',
  marginBottom: theme.spacing(2),
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

// Add a Logo component at the top of the Dashboard
const Logo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 2,
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      }}
    >
      {/* Eye shape */}
      <Box
        sx={{
          width: 24,
          height: 16,
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Pupil */}
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'primary.dark',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </Box>
      
      {/* Emotion indicators */}
      <Box
        sx={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#ff9800',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: 'white',
        }}
      >
        😊
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: -2,
          left: -2,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#f44336',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          color: 'white',
        }}
      >
        😢
      </Box>
    </Box>
    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
      MoodMirror
    </Typography>
  </Box>
);

// Add usage tracking constants
const FREE_USAGE_LIMIT = 3;
const USAGE_COUNT_KEY = 'moodMirror_usageCount';
const LAST_USAGE_TIME_KEY = 'moodMirror_lastUsageTime';
const USAGE_RESET_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Logo />
      
      {/* Add usage count indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {getTimeRemaining()}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
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
                <Button
                  variant="contained"
                  onClick={handleStartCapture}
                  disabled={!isModelLoaded || !canUseApp}
                >
                  {!canUseApp ? 'Usage Limit Reached' : isModelLoaded ? 'Start Capturing' : 'Loading Models...'}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={handleStopCapture}
                >
                  Stop Capturing
                </Button>
              )}
            </Box>

            {detectedEmotion && (
              <Box sx={{ textAlign: 'center' }}>
                <EmotionIcon>
                  {emotionToEmoji[detectedEmotion]}
                </EmotionIcon>
                <EmotionTitle variant="h5">
                  {detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)}
                </EmotionTitle>
                <EmotionDescription>
                  {currentEmotion && `Confidence: ${(currentEmotion.confidence * 100).toFixed(1)}%`}
                </EmotionDescription>
                
                {showConfirmButton && (
                  <Button
                    variant="contained"
                    onClick={handleConfirmEmotion}
                  >
                    Confirm Emotion
                  </Button>
                )}
              </Box>
            )}
          </EmotionContainer>
          
          {/* Emotion Statistics - moved here to appear below camera column */}
          <EmotionStats />
        </Box>

        <Box sx={{ flex: 1 }}>
          <EmotionContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <EmotionTitle variant="h5">
                Recommendations
              </EmotionTitle>
              {showEmotionResult && (
                <Button
                  variant="outlined"
                  onClick={handleRefreshRecommendations}
                  disabled={isLoadingRecommendations}
                  size="small"
                  title="Get a new AI-generated recommendation for the same emotion"
                  sx={{ 
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {isLoadingRecommendations ? 'Loading...' : 'Get New AI Suggestion'}
                </Button>
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
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
      <Box sx={{ mt: 4, textAlign: 'center', pb: 2 }}>
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