import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
          main: '#F76902',
        },
        secondary: {
          main: '#90caf9', // Default secondary for contrast
        },
        background: {
          default: ' #121212',
          paper: ' #1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        },
        memberPerMajorText: {
          default: '#ffffff',
        },
        activeStatus: {
          default: '#3ab13e'
        },
        generalStatus: {
          default: '#d3d3d3'
        },
        exemptStatus: {
          default: '#f09efd'
        }
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: ' #F76902',
              color: '#ffffff',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              fontWeight: 600,
            },
            contained: {
              backgroundColor: '#F76902',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#e65d00',
              },
            },
            outlined: {
              borderColor: '#F76902',
              color: '#F76902',
              '&:hover': {
                borderColor: '#e65d00',
                backgroundColor: '#fff4e6',
              },
            },
            text: {
              color: '#F76902',
              '&:hover': {
                backgroundColor: '#fff4e6',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            //changes go here
          },
        },
        MuiTypography: {
          styleOverrides: {
            h1: {
              fontSize: '2.25rem',
              fontWeight: 600,
              color: '#ffffff',
            },
            h2: {
              fontSize: '2rem',
              fontWeight: 500,
              color: '#ffffff',
            },
            body1: {
              fontSize: '1rem',
              color: '#b0b0b0',
            },
          },
        },
      },
});

export default darkTheme;
