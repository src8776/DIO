import * as React from "react";
import { Link } from "react-router-dom";
import {
    AppBar,
    Box,
    CssBaseline,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    IconButton,
} from "@mui/material";
import {
    AccountCircle,
    Brightness4,
    Brightness7,
} from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";

export default function DrawerAppBar({ toggleTheme, mode }) {
    const [appBarAnchorEl, setAppBarAnchorEl] = React.useState(null);
    
    // Detect if screen size is xs
    const isXs = useMediaQuery((theme) => theme.breakpoints.only("xs"));
    // Set title text based on screen size
    const titleText = isXs ? "RIT | DIO" : "RIT | Diversity Initiatives Office";

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
                window.location.href = "/";
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
                    </Box>
                </Toolbar>
            </AppBar>
            <Box component="main">
                <Toolbar />
            </Box>
        </Box>
    );
}