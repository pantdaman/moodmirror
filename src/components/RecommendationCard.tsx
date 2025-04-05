import React, { useState } from 'react';
import { Recommendation } from '../types';
import { getDetailedSteps } from '../services/geminiService';
import { fetchRecommendationDetails, fetchYouTubeDetails } from '../services/webService';
import { Theme } from '@mui/material/styles';
import { Card, CardContent, Typography, Button, Box, Chip, Link, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Default theme values
const defaultTheme = {
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

// Styled components with default theme values
const StyledCard = styled(Card)(({ theme = defaultTheme }) => ({
  marginBottom: '16px',
  transition: 'all 0.3s ease-in-out',
  borderRadius: '12px',
  boxShadow: theme.customColors.shadow,
  backgroundColor: theme.customColors.background,
  border: `1px solid ${theme.customColors.border}`,
  '&:hover': {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px)',
  },
}));

const StyledTitle = styled(Typography)(({ theme = defaultTheme }) => ({
  color: theme.customColors.text,
  fontWeight: 600,
  marginBottom: '8px',
}));

const StyledDescription = styled(Typography)(({ theme = defaultTheme }) => ({
  color: theme.customColors.text,
  marginBottom: '16px',
}));

const StyledChip = styled(Chip)(({ theme = defaultTheme }) => ({
  backgroundColor: theme.customColors.primary,
  color: theme.customColors.background,
  marginRight: '8px',
  marginBottom: '8px',
}));

const StyledButton = styled(Button)(({ theme = defaultTheme }) => ({
  backgroundColor: theme.customColors.accent,
  color: '#ffffff',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: theme.customColors.secondary,
    color: '#ffffff',
  },
}));

const StyledLink = styled(Link)(({ theme = defaultTheme }) => ({
  color: theme.customColors.accent,
  textDecoration: 'none',
  '&:hover': {
    color: theme.customColors.secondary,
    textDecoration: 'underline',
  },
}));

interface RecommendationCardProps {
  recommendation: Recommendation;
  theme?: Theme;
  onFeedback?: (helpful: boolean) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  theme,
  onFeedback
}) => {
  const {
    title,
    description,
    source,
    mediaType,
    duration,
    mediaSuggestion,
    isAIGenerated,
    youtubeLink,
    contentType,
    contentContext
  } = recommendation;

  const [showDetails, setShowDetails] = useState(false);
  const [detailedSteps, setDetailedSteps] = useState<string>('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [websiteDetails, setWebsiteDetails] = useState<string | null>(null);
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(false);
  const [showWebsiteDetails, setShowWebsiteDetails] = useState(false);

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'audio':
        return '🎵';
      case 'video':
        return '🎥';
      case 'text':
        return '📝';
      case 'activity':
        return '🏃';
      default:
        return '📌';
    }
  };

  const handleShowDetails = async () => {
    if (!showDetails && !detailedSteps) {
      setIsLoadingDetails(true);
      try {
        const steps = await getDetailedSteps(recommendation);
        setDetailedSteps(steps);
      } catch (error) {
        console.error('Error fetching detailed steps:', error);
        setDetailedSteps('Unable to load detailed steps. Please try again later.');
      } finally {
        setIsLoadingDetails(false);
      }
    }
    setShowDetails(!showDetails);
  };

  const handleYouTubeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (youtubeLink) {
      // Open the YouTube link in a new tab
      window.open(youtubeLink, '_blank', 'noopener,noreferrer');
      
      // Fetch YouTube details
      if (!websiteDetails) {
        setIsLoadingWebsite(true);
        try {
          const details = await fetchYouTubeDetails(recommendation);
          setWebsiteDetails(details);
          setShowWebsiteDetails(true);
        } catch (error) {
          console.error('Error fetching YouTube details:', error);
          setWebsiteDetails('Unable to load YouTube details. Please try again later.');
        } finally {
          setIsLoadingWebsite(false);
        }
      } else {
        setShowWebsiteDetails(!showWebsiteDetails);
      }
    }
  };

  const handleMediaSuggestionClick = async (url: string) => {
    if (!url) return;
    
    setIsLoadingWebsite(true);
    setShowWebsiteDetails(true);
    
    try {
      // Open the URL in a new tab
      window.open(url, '_blank');
      
      // Fetch website details
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.contents) {
        // Extract title and description from HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        const title = doc.querySelector('title')?.textContent || '';
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        setWebsiteDetails(`${title}\n\n${description}`);
      }
    } catch (error) {
      console.error('Error fetching website details:', error);
      setWebsiteDetails('Unable to fetch website details.');
    } finally {
      setIsLoadingWebsite(false);
    }
  };

  // Helper function to check if a string is a URL
  const isUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Function to render media suggestion with clickable links
  const renderMediaSuggestion = () => {
    if (!mediaSuggestion) return null;

    if (isUrl(mediaSuggestion)) {
      return (
        <Box sx={{ mt: 2 }}>
          <StyledButton
            variant="contained"
            onClick={() => handleMediaSuggestionClick(mediaSuggestion as string)}
            fullWidth
          >
            Open Link
          </StyledButton>
          
          {showWebsiteDetails && (
            <Box sx={{ mt: 2, p: 2, bgcolor: theme?.customColors?.background || '#ffffff', borderRadius: 1 }}>
              {isLoadingWebsite ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress sx={{ color: theme?.customColors?.primary || '#3f51b5' }} />
                </Box>
              ) : websiteDetails ? (
                <Typography sx={{ color: theme?.customColors?.text || '#4A4A4A', whiteSpace: 'pre-line' }}>
                  {websiteDetails}
                </Typography>
              ) : null}
            </Box>
          )}
        </Box>
      );
    }

    // Check if the mediaSuggestion contains URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = mediaSuggestion.split(urlRegex);
    
    if (parts.length > 1) {
      return (
        <Typography sx={{ color: theme?.customColors?.text || '#4A4A4A', mt: 2 }}>
          {parts.map((part, index) => {
            if (isUrl(part)) {
              return (
                <StyledLink
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {part}
                </StyledLink>
              );
            }
            return part;
          })}
        </Typography>
      );
    }

    // If no URLs found, render as plain text
    return (
      <Typography sx={{ color: theme?.customColors?.text || '#4A4A4A', mt: 2 }}>
        {mediaSuggestion}
      </Typography>
    );
  };

  // Check if we have any media available (YouTube link or media suggestion with URL)
  const hasMediaAvailable = youtubeLink || (mediaSuggestion && isUrl(mediaSuggestion));

  return (
    <StyledCard theme={theme}>
      <CardContent>
        <StyledTitle variant="h6" theme={theme}>
          {title}
        </StyledTitle>
        
        <StyledDescription theme={theme}>
          {description}
        </StyledDescription>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
          {source && (
            <StyledChip label={`Source: ${source}`} theme={theme} />
          )}
          {duration && (
            <StyledChip label={`Duration: ${duration}`} theme={theme} />
          )}
          {contentType && (
            <StyledChip label={`Type: ${contentType}`} theme={theme} />
          )}
        </Box>
        
        {contentContext && (
          <Typography sx={{ color: theme?.customColors?.text || '#4A4A4A', mb: 2, fontStyle: 'italic' }}>
            {contentContext}
          </Typography>
        )}
        
        {renderMediaSuggestion()}
        
        {youtubeLink && (
          <Box sx={{ mt: 2 }}>
            <StyledButton
              variant="contained"
              onClick={handleYouTubeClick}
              fullWidth
            >
              Watch on YouTube
            </StyledButton>
          </Box>
        )}
        
        {!hasMediaAvailable && (
          <>
            <button
              onClick={handleShowDetails}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showDetails ? 'Hide Details' : 'Show Detailed Steps'}
              {isLoadingDetails && (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></span>
              )}
            </button>
            
            {showDetails && detailedSteps && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Detailed Steps:</h4>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {detailedSteps}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {onFeedback && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onFeedback(true)}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Helpful
          </button>
          <button
            onClick={() => onFeedback(false)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Not Helpful
          </button>
        </div>
      )}
    </StyledCard>
  );
}; 