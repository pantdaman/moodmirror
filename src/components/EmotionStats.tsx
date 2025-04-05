import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress,
  LinearProgress,
  Grid,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { EmotionType } from '../types';
import { getEmotionPercentages, TimeBasedStats, getTimeBasedStats } from '../services/emotionStatsService';

// Styled components
const StatsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
}));

const StatsTitle = styled(Typography)(({ theme }) => ({
  color: '#4A4A4A',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const EmotionBar = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const EmotionLabel = styled(Typography)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(0.5),
}));

const EmotionName = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
}));

const EmotionPercentage = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
}));

// Emotion to emoji mapping
const emotionToEmoji: Record<EmotionType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲',
  neutral: '😐'
};

// Emotion to color mapping
const emotionToColor: Record<EmotionType, string> = {
  happy: '#4CAF50', // Green
  sad: '#2196F3',   // Blue
  angry: '#F44336', // Red
  fearful: '#9C27B0', // Purple
  disgusted: '#795548', // Brown
  surprised: '#FF9800', // Orange
  neutral: '#607D8B'  // Blue Grey
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stats-tabpanel-${index}`}
      aria-labelledby={`stats-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `stats-tab-${index}`,
    'aria-controls': `stats-tabpanel-${index}`,
  };
}

const EmotionStats: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [percentages, setPercentages] = useState<Record<EmotionType, number>>({} as Record<EmotionType, number>);
  const [rawStats, setRawStats] = useState<TimeBasedStats>({} as TimeBasedStats);
  const [isLoading, setIsLoading] = useState(true);

  // Time frame options
  const timeFrames = ['lastHour', 'lastDay', 'lastWeek', 'total'];
  const timeFrameLabels = ['Last Hour', 'Last 24 Hours', 'Last Week', 'All Time'];

  // Load statistics
  useEffect(() => {
    const loadStats = () => {
      setIsLoading(true);
      try {
        // Get percentages for the selected time frame
        const currentTimeFrame = timeFrames[tabValue] as 'lastHour' | 'lastDay' | 'lastWeek' | 'total';
        const emotionPercentages = getEmotionPercentages(currentTimeFrame);
        setPercentages(emotionPercentages);
        
        // Get raw stats for display
        const stats = getTimeBasedStats();
        setRawStats(stats);
      } catch (error) {
        console.error('Error loading emotion stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
    
    // Set up interval to refresh stats every minute
    const intervalId = setInterval(loadStats, 60000);
    
    return () => clearInterval(intervalId);
  }, [tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Sort emotions by percentage (descending)
  const sortedEmotions = Object.entries(percentages)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion]) => emotion as EmotionType);

  return (
    <StatsContainer>
      <StatsTitle variant="h5">
        Emotion Statistics
      </StatsTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="emotion statistics tabs"
          variant="fullWidth"
        >
          {timeFrameLabels.map((label, index) => (
            <Tab key={index} label={label} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {timeFrames.map((timeFrame, index) => (
            <TabPanel key={index} value={tabValue} index={index}>
              <Box>
                {sortedEmotions.map((emotion) => (
                  <EmotionBar key={emotion}>
                    <EmotionLabel>
                      <EmotionName>
                        {emotionToEmoji[emotion]} {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      </EmotionName>
                      <EmotionPercentage>
                        {percentages[emotion].toFixed(1)}%
                      </EmotionPercentage>
                    </EmotionLabel>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentages[emotion]} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: emotionToColor[emotion],
                        }
                      }} 
                    />
                  </EmotionBar>
                ))}
              </Box>
            </TabPanel>
          ))}
        </>
      )}
    </StatsContainer>
  );
};

export default EmotionStats;

 