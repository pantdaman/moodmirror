// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import { getEmotionTheme } from './utils/emotionThemes';

const App: React.FC = () => {
  // Start with neutral theme
  const theme = getEmotionTheme('neutral');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;// Updated at Sun Apr  6 16:26:23 IST 2025
// Updated at Sun Apr  6 16:30:31 IST 2025
