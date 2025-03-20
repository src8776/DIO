import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import wicLogo from '/public/wichacks-logo.png';
import comsLogo from '/public/com_logo.png';
import cshLogo from '/public/csh_logo_square.png';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper
} from '@mui/material';
import { checkAuth } from '../../ProtectedRoute';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isProduction = API_BASE_URL.includes("https://dio.gccis.rit.edu");

const WelcomePage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    if (isProduction) {
      const checkAuthentication = async () => {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus);
      };

      checkAuthentication();
    } else {
      setIsAuthenticated(true); // Assume authenticated in non-production environments
    }
  }, []);

  const handleLogin = () => {
    navigate('/saml2/login');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box sx={{
        bgcolor: 'background.default',
        pt: 8,
        pb: 8
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                gutterBottom
                fontWeight="bold"
              >
                Track your club
                <Typography
                  component="span"
                  variant="h2"
                  sx={{ display: 'block', fontWeight: 'bold' }}
                >
                  membership journey
                </Typography>
              </Typography>
              <Typography variant="h5" color="text.secondary">
                Keep track of your active membership, monitor attendance, and earn rewards for your points towards participation in RIT's GCCIS vibrant club community.
              </Typography>
              {isAuthenticated === null ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled
                  sx={{ mt: 4 }}
                >
                  Loading...
                </Button>
              ) : isAuthenticated ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleHome}
                  sx={{ mt: 4 }}
                >
                  Home
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleLogin}
                  sx={{ mt: 4 }}
                >
                  Member Login
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={4}>
                <CardMedia
                  component="img"
                  height="300"
                  image="DashboardOverlay.png"
                  alt="Students at club event"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Not a member yet?
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Discover clubs below that match your interests and begin your journey today.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Club Categories */}
      <Container sx={{ py: 8,bgcolor: 'background.paper' }} maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" color="primary">
            Discover
          </Typography>
          <Typography variant="h3" component="h2" gutterBottom color="text.primary">
            Find your community
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mx: 'auto', maxWidth: 600 }}>
            Explore RIT's Student clubs and find where you belong.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              title: "Women in Computing",
              description: "Promoting the success and advancement of women and all gender minorities in their academic and professional careers.",
              icon: wicLogo, 
              URL: "https://www.rit.edu/womenincomputing/",
              bgColor: '#ce93d8'
            },
            {
              title: "Computing Organization of Multicultural Students",
              description: "building a supportive community that celebrates the talent of underrepresented students in computing.",
              icon: comsLogo,
              URL: "https://www.rit.edu/computing/coms/",
              bgColor: '#e3f2fd' 
            },
            {
              title: "Computer Science house",
              description: "Enabling its members grow intellectually, socially, and professionally continues to succeed and surpass expectations..",
              icon: cshLogo,
              URL: "https://www.csh.rit.edu/",
              bgColor: '#fff3e0' 
            }
          ].map((club, index) => (
            <Grid item key={index} xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  bgcolor: club.bgColor,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    height: 80,
                    width: 'auto',
                    objectFit: 'contain',
                    mb: 2,
                    marginX: 'auto' // Centers the image horizontally
                  }}
                  image={club.icon}
                  alt={`${club.title} logo`}
                />
                <Typography variant="h5" component="h3" gutterBottom color="text.primary">
                  {club.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }} color="text.secondary">
                  {club.description}
                </Typography>
                <Button
                  sx={{ mt: 'auto' }}
                  variant="contained"
                  color="primary"
                  component="a"
                  href={club.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more →
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="primary">
              Features
            </Typography>
            <Typography variant="h3" component="h2" gutterBottom color="text.primary">
              Your membership, simplified
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mx: 'auto', maxWidth: 600 }}>
              Our app makes tracking club involvement easier than ever.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                title: "Track Attendance and Remain An Active Member",
                description: "Easily record your attendance at meetings and events per semester."
              },
              {
                title: "Monitor Progress",
                description: "See your progress toward active membership status and recognition goals."
              },
              {
                title: "Receive Point Rewards",
                description: "Earn and track rewards for your contributions."
              },
              {
                title: "Access History",
                description: "View your complete membership history throughout your time at RIT."
              }
            ].map((feature, index) => (
              <Grid item key={index} xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom color="text.primary">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6" color="primary" fontWeight="bold">
                RIT DIO Membership Tracker
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} RIT Diversity and Initiatives Office (DIO). All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;