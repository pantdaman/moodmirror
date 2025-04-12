import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { EmotionType, EmotionData } from '../types';

// Styled components
const ConfirmationContainer = styled(Paper)(({ theme }) => ({
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

const DetectedEmotionBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const EmotionRadioLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1),
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  flex: '1 1 calc(33.333% - 8px)',
  minWidth: '120px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'rgba(63, 81, 181, 0.04)',
  },
  '@media (prefers-color-scheme: dark)': {
    border: '1px solid #d0d0d0',
    '&:hover': {
      backgroundColor: 'rgba(63, 81, 181, 0.1)',
    },
  }
}));

// Emotion to emoji mapping
const emotionEmojis: Record<EmotionType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲',
  neutral: '😐'
};

// Emotion messages
const emotionMessages: Record<EmotionType, string> = {
  happy: "It's wonderful to feel happy! Enjoy this positive moment.",
  sad: "It's okay to feel sad. Your emotions are valid and will pass.",
  angry: "It's normal to feel angry sometimes. Take a deep breath and give yourself a moment.",
  fearful: "It's okay to feel afraid. Remember that you are safe and this feeling will pass.",
  disgusted: "It's okay to feel disgusted. Your body is telling you something important.",
  surprised: "Surprise can be exciting! Embrace the unexpected.",
  neutral: "A neutral mood is perfectly fine. It's a moment of balance."
};

interface EmotionConfirmationProps {
  detectedEmotion: EmotionData | null;
  onConfirm: (emotion: EmotionData, note?: string) => void;
  onCancel: () => void;
}

export const EmotionConfirmation: React.FC<EmotionConfirmationProps> = ({
  detectedEmotion,
  onConfirm,
  onCancel
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(
    detectedEmotion?.emotion as EmotionType || null
  );

  const handleEmotionSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEmotion(event.target.value as EmotionType);
  };

  const handleConfirm = () => {
    if (selectedEmotion) {
      onConfirm({
        emotion: selectedEmotion,
        confidence: detectedEmotion?.confidence || 0.5
      });
    }
  };

  return (
    <ConfirmationContainer elevation={3}>
      {detectedEmotion && (
        <DetectedEmotionBox>
          <Typography variant="caption" color="text.secondary">
            Detected Emotion
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            backgroundColor: 'rgba(63, 81, 181, 0.05)',
            padding: '8px 16px',
            borderRadius: '20px'
          }}>
            <Typography variant="h4">
              {emotionEmojis[detectedEmotion.emotion as EmotionType]}
            </Typography>
            <Box>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {detectedEmotion.emotion}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Confidence: {(detectedEmotion.confidence * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant="body2" 
            sx={{
              fontStyle: 'italic', 
              color: '#666666',
              textAlign: 'center',
              mt: 1,
              maxWidth: '80%'
            }}
          >
            {emotionMessages[detectedEmotion.emotion as EmotionType]}
          </Typography>
        </DetectedEmotionBox>
      )}

      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          If you're feeling different, please select from the options below and confirm
        </Typography>
      </Box>

      <FormControl component="fieldset" sx={{ width: '100%', mb: 1 }}>
        <RadioGroup
          value={selectedEmotion || ''}
          onChange={handleEmotionSelect}
          sx={{ 
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          {Object.entries(emotionEmojis).map(([emotion, emoji]) => (
            <EmotionRadioLabel
              key={emotion}
              value={emotion}
              control={<Radio size="small" />}
              label={
                <>
                  <Typography variant="h5">{emoji}</Typography>
                  <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                    {emotion}
                  </Typography>
                </>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button 
          size="small" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          size="small"
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedEmotion}
        >
          Confirm
        </Button>
      </Box>
    </ConfirmationContainer>
  );
}; 