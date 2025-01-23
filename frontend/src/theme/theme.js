import { createTheme } from "@mui/material";

// could create a light / dark mode

const theme = createTheme ({
    palette: {
        primary: {
            main: "#F76902",
        },
        secondary: {
            main: "#2e74c9"
        },
        white: {
            main: "#FFFFFF",
            light: '#D0D3D4',
            dark: '#A2AAAD',
            contrastText: '#000000'
        },
        gray: {
            main: "#D0D3D4",
            light: '#A2AAAD',
            dark: '#7C878E',
            contrastText: '#000000'
        },
    },
    typography: {
        h1: {
            fontSize: "3rem",
            fontWeight: 600,
        },
        h2: {
            fontSize: "1.75rem",
            fontWeight: 600,
        },
        h3: {
            fontSize: "1.5rem",
            fontWeight: 600,
        },
    },
})

export default theme