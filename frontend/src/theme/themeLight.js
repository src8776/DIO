import { createTheme } from "@mui/material";

const theme = createTheme ({
    palette: {
        mode: 'light',
        primary: {
          main: '#F76902',
        },
        secondary: {
          main: '#1976d2', // Default secondary for contrast
        },
        background: {
          default: '#f9f9f9',
          paper: '#ffffff',
        },
        text: {
          primary: '#000000',
          secondary: '#5f5f5f',
        },
        memberPerMajorText: {
          default: '#4c4c4c',
        },
        activeStatus: {
          default: '#009605'
        },
        generalStatus: {
          default: '#575757'
        },
        exemptStatus: {
          default: ' #980aae'
        }
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: '#F76902',
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
            },
            h2: {
              fontSize: '2rem',
              fontWeight: 500,
            },
            body1: {
              fontSize: '1rem',
              color: '#5f5f5f',
            },
          },
        },
      },
    });

export default theme