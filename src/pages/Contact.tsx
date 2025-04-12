import React from 'react';
import { 
  Container, 
  Typography, 
  Paper,
  Box,
  Button,
  SvgIcon,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Email icon as an SVG path
const EmailIcon = () => (
  <SvgIcon>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </SvgIcon>
);

// Close icon as an SVG path
const CloseIcon = () => (
  <SvgIcon>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 10.59 17.59 19 19 17.59 13.41 12z"/>
  </SvgIcon>
);

// Styled components
const ContactContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const ContactPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[10],
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
}));

const EmailButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)'
    : 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
  boxShadow: '0 3px 5px 2px rgba(255, 107, 107, .3)',
  color: 'white',
  fontWeight: 'bold',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)'
      : 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
  },
}));

const Contact = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const emailAddress = 'contact@moodmeter.in';

  const handleEmailClick = () => {
    window.location.href = `mailto:${emailAddress}`;
  };

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <ContactContainer maxWidth="md">
      <CloseButton onClick={handleClose} aria-label="close">
        <CloseIcon />
      </CloseButton>
      
      <ContactPaper elevation={3}>
        <Typography 
          component="h1" 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)'
              : 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Contact Us
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Have questions or feedback? We'd love to hear from you. Feel free to reach out to us directly via email.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          <EmailButton
            variant="contained"
            startIcon={<EmailIcon />}
            onClick={handleEmailClick}
            size="large"
          >
            Email Us
          </EmailButton>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {emailAddress}
          </Typography>
        </Box>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            We typically respond within 24-48 hours.
          </Typography>
        </Box>
      </ContactPaper>
    </ContactContainer>
  );
};

export default Contact; 