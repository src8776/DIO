import React, { useState } from 'react';
import { ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route } from 'react-router-dom';
import AppBar from './components/AppBar';
import LandingPage from './pages/LandingPage/LandingPage';
import AdminDash from './pages/AdminDashboard/AdminDashPage';
import AcctSetup from './pages/AccountSetup/AccountSetupPage';
import MemberDetailsModal from './components/MemberDetailsModal.jsx'
import lightTheme from './theme/themeLight.js';
import darkTheme from './theme/themeDark.js';

const App = () => {
  const [mode, setMode] = useState('light');

    // toggle dark/light mode
    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      };

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />=
      <AppBar toggleTheme={toggleTheme} mode={mode} />
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminDash />} />
            <Route path="/acctSetup" element={<AcctSetup />} />
            <Route path="/memberDetails" element={<MemberDetailsModal />} />
        </Routes>
    </ThemeProvider>
  );
};

export default App;
