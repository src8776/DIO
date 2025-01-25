import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route } from 'react-router-dom';
import AppBar from './components/AppBar';
import LandingPage from './pages/LandingPage/LandingPage';
import AdminDash from './pages/AdminDashboard/AdminDashPage';
import AcctSetup from './pages/AccountSetup/AccountSetupPage';
import AddMember from './pages/AddMember/AddMemberPage';
import lightTheme from './theme/themeLight.js';
import darkTheme from './theme/themeDark.js';

const App = () => {
  // dark/light mode based on system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [mode, setMode] = useState(systemPrefersDark ? 'dark' : 'light');

  // Toggle dark/light mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Update mode if system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      setMode(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <AppBar toggleTheme={toggleTheme} mode={mode} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminDash />} />
        <Route path="/acctSetup" element={<AcctSetup />} />
        <Route path="/addMember" element={<AddMember />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
