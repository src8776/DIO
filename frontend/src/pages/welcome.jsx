import React from 'react';
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
  AppBar as MuiAppBar,
  Toolbar,
  Paper
} from '@mui/material';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLearnMore = (clubType) => {
    navigate(`/clubs/${clubType}`);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box sx={{
        bgcolor: 'background.paper',
        pt: 8,
        pb: 8,
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="text.primary"
                gutterBottom
                fontWeight="bold"
              >
                Track your club
                <Typography
                  component="span"
                  variant="h2"
                  sx={{ display: 'block', color: 'primary.main', fontWeight: 'bold' }}
                >
                  membership journey
                </Typography>
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                Follow your progress, track attendance, and earn recognition for your contributions to RIT's GCCIS vibrant club community.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleLogin}
                sx={{ mt: 4 }}
              >
                Member Login
              </Button>
              {/* <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={handleLogin}
                sx={{ mt: 4 }}
              >
                Learn More
              </Button> */}
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={4}>
                <CardMedia
                  component="img"
                  height="300"
                  image="../public/diopage.png"
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
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" color="primary">
            Discover
          </Typography>
          <Typography variant="h3" component="h2" gutterBottom>
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
                <Typography variant="h5" component="h3" gutterBottom>
                  {club.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
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
            <Typography variant="h3" component="h2" gutterBottom>
              Your membership, simplified
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mx: 'auto', maxWidth: 600 }}>
              Our app makes tracking club involvement easier than ever.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                title: "Track Attendance",
                description: "Easily record your attendance at meetings and events."
              },
              {
                title: "Monitor Progress",
                description: "See your progress toward active membership status and recognition goals."
              },
              {
                title: "Receive Recognition",
                description: "Earn and track recognitions for your contributions."
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
                    <Typography variant="h6" component="h3" gutterBottom>
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