import { EmotionType } from '../types';
import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

// Define color themes for different emotions
export interface EmotionThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  shadow: string;
}

// Extend the Theme type to include our custom colors
declare module '@mui/material/styles' {
  interface Theme {
    customColors: EmotionThemeColors;
  }
  interface ThemeOptions {
    customColors?: EmotionThemeColors;
  }
}

// Emotion-based color themes
export const emotionColors: Record<EmotionType, EmotionThemeColors> = {
  happy: {
    primary: '#FFD700', // Gold
    secondary: '#FFA500', // Orange
    accent: '#FF6B6B', // Coral
    background: '#FFF9E6', // Light yellow
    text: '#4A4A4A', // Dark gray
    border: '#FFE5B4', // Peach
    shadow: '0 4px 6px rgba(255, 215, 0, 0.2)' // Gold shadow
  },
  sad: {
    primary: '#6B8E9E', // Steel blue
    secondary: '#4A7B8C', // Darker blue
    accent: '#A8C6DF', // Light blue
    background: '#F0F7FA', // Light blue background
    text: '#4A4A4A', // Dark gray
    border: '#D1E3ED', // Light blue border
    shadow: '0 4px 6px rgba(107, 142, 158, 0.2)' // Blue shadow
  },
  angry: {
    primary: '#E74C3C', // Red
    secondary: '#C0392B', // Dark red
    accent: '#F39C12', // Orange
    background: '#FDF2F2', // Light red background
    text: '#4A4A4A', // Dark gray
    border: '#FADBD8', // Light red border
    shadow: '0 4px 6px rgba(231, 76, 60, 0.2)' // Red shadow
  },
  fearful: {
    primary: '#9B59B6', // Purple
    secondary: '#8E44AD', // Dark purple
    accent: '#3498DB', // Blue
    background: '#F8F4FB', // Light purple background
    text: '#4A4A4A', // Dark gray
    border: '#E8D9F3', // Light purple border
    shadow: '0 4px 6px rgba(155, 89, 182, 0.2)' // Purple shadow
  },
  disgusted: {
    primary: '#2ECC71', // Green
    secondary: '#27AE60', // Dark green
    accent: '#F1C40F', // Yellow
    background: '#F2FBF5', // Light green background
    text: '#4A4A4A', // Dark gray
    border: '#D5F5E3', // Light green border
    shadow: '0 4px 6px rgba(46, 204, 113, 0.2)' // Green shadow
  },
  surprised: {
    primary: '#F1C40F', // Yellow
    secondary: '#F39C12', // Orange
    accent: '#E74C3C', // Red
    background: '#FEF9E7', // Light yellow background
    text: '#4A4A4A', // Dark gray
    border: '#FCF3CF', // Light yellow border
    shadow: '0 4px 6px rgba(241, 196, 15, 0.2)' // Yellow shadow
  },
  neutral: {
    primary: '#95A5A6', // Gray
    secondary: '#7F8C8D', // Dark gray
    accent: '#34495E', // Dark blue-gray
    background: '#F8F9F9', // Light gray background
    text: '#4A4A4A', // Dark gray
    border: '#ECF0F1', // Light gray border
    shadow: '0 4px 6px rgba(149, 165, 166, 0.2)' // Gray shadow
  }
};

// Get theme for a specific emotion
export const getEmotionTheme = (emotion: EmotionType): Theme => {
  const colors = emotionColors[emotion] || emotionColors.neutral;
  
  return createTheme({
    palette: {
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: colors.background,
        paper: colors.background,
      },
      text: {
        primary: colors.text,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
            color: colors.text,
          },
        },
      },
    },
    customColors: colors,
  });
};

// Get emotion icon
export const getEmotionIcon = (emotion: EmotionType): string => {
  const icons: Record<EmotionType, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😲',
    neutral: '😐'
  };
  
  return icons[emotion] || icons.neutral;
};

// Get emotion description
export const getEmotionDescription = (emotion: EmotionType): string => {
  const descriptions: Record<EmotionType, string> = {
    happy: "You're feeling happy! That's great to see.",
    sad: "I notice you seem a bit sad. It's okay to feel this way sometimes.",
    angry: "You appear to be feeling angry. Let's find something to help you process this emotion.",
    fearful: "I sense some fear in your expression. Let's work on feeling more secure.",
    disgusted: "You seem to be feeling disgusted. Let's find something to shift your mood.",
    surprised: "You look surprised! Something must have caught you off guard.",
    neutral: "You appear to be in a neutral state. A good time for reflection."
  };
  
  return descriptions[emotion] || descriptions.neutral;
}; 