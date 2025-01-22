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