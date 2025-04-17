import * as React from "react";
import { Link } from "react-router-dom";
import {
    AppBar, Box, CssBaseline,
    Menu, MenuItem, Toolbar,
    Typography, IconButton,
} from "@mui/material";
import {
    AccountCircle,
    Brightness4,
    Brightness7,
} from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";
import { checkAuth } from '../ProtectedRoute';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isProduction = API_BASE_URL.includes("https://dio.gccis.rit.edu");

/**
 * AppBar.jsx
 * 
 * This React component renders a responsive application bar (AppBar) for the application. It provides navigation,
 * theme toggling, and user account management options. The AppBar dynamically adjusts based on the user's
 * authentication status and screen size.
 * 
 * Key Features:
 * - Displays the application title with a responsive design for smaller screens.
 * - Provides a theme toggle button to switch between light and dark modes.
 * - Includes a user account menu with options for viewing the profile and logging out.
 * - Handles user authentication status and adjusts the UI accordingly.
 * 
 * Props:
 * - toggleTheme: Function to toggle between light and dark themes.
 * - mode: String representing the current theme mode ("light" or "dark").
 * 
 * Dependencies:
 * - React, Material-UI components, and icons.
 * - React Router for navigation.
 * - Custom utility: `checkAuth` for verifying user authentication.
 * 
 * Functions:
 * - handleAppBarMenu: Opens the user account menu.
 * - handleAppBarClose: Closes the user account menu.
 * - handleLogout: Logs the user out and redirects to the logout page.
 * 
 * Hooks:
 * - React.useState: Manages state for the AppBar menu and authentication status.
 * - React.useEffect: Checks user authentication status on component mount.
 * - Material-UI's `useMediaQuery`: Adjusts the title text based on screen size.
 * 
 * @component
 */
export default function DrawerAppBar({ toggleTheme, mode }) {
    const [appBarAnchorEl, setAppBarAnchorEl] = React.useState(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState(null);

    const isXs = useMediaQuery((theme) => theme.breakpoints.only("xs"));
    const titleText = isXs ? "RIT | DIO" : "RIT | Diversity Initiatives Office";

    React.useEffect(() => {
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

    const handleAppBarMenu = (event) => {
        setAppBarAnchorEl(event.currentTarget);
    };

    const handleAppBarClose = () => {
        setAppBarAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch("/saml2/logout", {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                window.location.href = "/closeBrowser";
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar component="nav" elevation={1}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                            {titleText}
                        </Link>
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
                        <IconButton color="inherit" onClick={toggleTheme}>
                            {mode === "light" ? <Brightness4 /> : <Brightness7 />}
                        </IconButton>
                        {isAuthenticated && (
                            <div>
                                <IconButton
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="appbar-menu"
                                    aria-haspopup="true"
                                    onClick={handleAppBarMenu}
                                    color="inherit"
                                >
                                    <AccountCircle />
                                </IconButton>
                                <Menu
                                    sx={{ mt: "45px" }}
                                    id="appbar-menu"
                                    anchorEl={appBarAnchorEl}
                                    anchorOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                    open={Boolean(appBarAnchorEl)}
                                    onClose={handleAppBarClose}
                                >
                                    <MenuItem component={Link} to={"/acctSetup"} onClick={handleAppBarClose}>
                                        Profile
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            handleLogout();
                                            handleAppBarClose();
                                        }}
                                    >
                                        Log Out
                                    </MenuItem>
                                </Menu>
                            </div>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <Box component="main">
                <Toolbar />
            </Box>
        </Box>
    );
}