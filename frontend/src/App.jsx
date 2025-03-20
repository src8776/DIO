import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppBar from './components/AppBar';
import LandingPage from './pages/LandingPage/LandingPage';
import AdminDash from './pages/AdminDashboard/AdminDashPage';
import AcctSetup from './pages/AccountSetup/AccountSetupPage';
import OrgSetup from './pages/OrganizationSetup/OrganizationSetupPage.jsx';
import OfficersList from './pages/OfficersList/OfficersPage.jsx';
import MemberDetailsModal from './pages/MemberDetails/MemberDetailsPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AnalyticsDash from './pages/AnalyticsDashboard/AnalyticsDashPage.jsx';
import lightTheme from './theme/themeLight.js';
import darkTheme from './theme/themeDark.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from './pages/LoginPage/login';
import UnauthorizedPage from './pages/Unauthorized/unauthorized.jsx';
import WelcomePage from './pages/Unauthorized/welcome.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isProduction = API_BASE_URL.includes("https://dio.gccis.rit.edu");

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

  // TODO: Protect all paths (except for "/").
  // Only to be accessible by ADMIN / EBOARD? USERS 
  const wrapWithProtectedRoute = (element) => {
    return isProduction ? <ProtectedRoute element={element} /> : element;
  };

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <AppBar toggleTheme={toggleTheme} mode={mode} />
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/" element={wrapWithProtectedRoute(<LandingPage />)} />
        <Route path="/admin/:org" element={wrapWithProtectedRoute(<AdminLayout />)}>
          <Route index element={wrapWithProtectedRoute(<AdminDash />)} />
          <Route path="memberDetails" element={wrapWithProtectedRoute(<MemberDetailsModal />)} />
          <Route path="organizationSetup" element={wrapWithProtectedRoute(<OrgSetup />)} />
          <Route path="officersList" element={wrapWithProtectedRoute(<OfficersList />)} />
          <Route path="analyticsDash" element={wrapWithProtectedRoute(<AnalyticsDash />)} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/acctSetup" element={wrapWithProtectedRoute(<AcctSetup />)} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
