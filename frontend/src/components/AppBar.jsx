import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    AppBar, Box, CssBaseline,
    Divider, Drawer, List,
    ListItem, ListItemButton, MenuItem,
    Menu, Toolbar, Typography, IconButton,
} from "@mui/material";
import {
    Menu as MenuIcon,
    AccountCircle,
    Brightness4,
    Brightness7
} from "@mui/icons-material";


// TODO: Add NavColumn links to this component in mobile view (hamburger menu) ONLY IF USER IS ADMIN
// TODO: Implement logout button

const drawerWidth = 240;

// Links for general navigation (currently empty, but can be populated if needed)
const navItems = [];

//toggleTheme and mode defined in App.jsx
export default function DrawerAppBar({ toggleTheme, mode}) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [drawerAnchorEl, setDrawerAnchorEl] = React.useState(null);
    const [appBarAnchorEl, setAppBarAnchorEl] = React.useState(null);
    
    // Get current location to determine orgType
    const location = useLocation();
    const match = location.pathname.match(/^\/admin\/([^\/]+)/);
    const orgType = match ? match[1] : null;
    
    // Define admin navigation items only if orgType is present
    const adminNavItems = orgType ? [
        { name: "Member Database", path: `/admin/${orgType}` },
        { name: "Officers", path: `/admin/${orgType}/officersList` },
        { name: "Organization Setup", path: `/admin/${orgType}/organizationSetup` },
    ] : [];

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const handleDrawerMenu = (event) => {
        setDrawerAnchorEl(event.currentTarget);
    };

    const handleAppBarMenu = (event) => {
        setAppBarAnchorEl(event.currentTarget);
    };

    const handleDrawerClose = () => {
        setDrawerAnchorEl(null);
    };

    const handleAppBarClose = () => {
        setAppBarAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/saml2/logout', {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                window.location.href = '/';
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };


    const drawer = (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            textAlign: 'center'
        }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                <Link
                    to="/"
                    onClick={handleDrawerToggle}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    RIT | DIO
                </Link>
            </Typography>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton sx={{ textAlign: 'center' }}>
                            <Link
                                to={item.path}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                {item.name}
                            </Link>
                        </ListItemButton>
                    </ListItem>
                ))}
                {/* Admin-specific navigation items for mobile view */}
                {adminNavItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton sx={{ textAlign: 'center' }}>
                            <Link
                                to={item.path}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                                onClick={handleDrawerToggle}
                            >
                                {item.name}
                            </Link>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{
                mt: 'auto',
                pb: 2,
                display: 'flex',
                justifyContent: 'space-around',
                gap: 2
            }}>
                <IconButton color="inherit" onClick={toggleTheme}>
                    {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
                </IconButton>
                <IconButton
                    aria-label="account of current user"
                    aria-controls="drawer-menu"
                    aria-haspopup="true"
                    onClick={handleDrawerMenu}
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <Menu
                    id="drawer-menu"
                    anchorEl={drawerAnchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    open={Boolean(drawerAnchorEl)}
                    onClose={handleDrawerClose}
                >
                    <MenuItem component={Link} to={"/acctSetup"} onClick={handleDrawerClose}>
                        Profile
                    </MenuItem>
                    <MenuItem onClick={() => { handleLogout(); handleDrawerClose(); }}>
                        Log Out
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar component="nav" elevation={1}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            RIT | Diversity Initiatives Office
                        </Link>
                    </Typography>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
                        {/* {navItems.map((item) => (
                            <Button key={item.name} component={Link} to={item.path} sx={{ color: '#fff' }}>
                                {item.name}
                            </Button>
                        ))} */}
                        {/*Toggle button for light/dark mode*/}
                        <IconButton color="inherit" onClick={toggleTheme}>
                            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
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
                                sx={{ mt: '45px' }}
                                id="appbar-menu"
                                anchorEl={appBarAnchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(appBarAnchorEl)}
                                onClose={handleAppBarClose}
                            >
                                <MenuItem component={Link} to={"/acctSetup"} onClick={handleAppBarClose}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={() => { handleLogout(); handleAppBarClose(); }}>
                                    Log Out
                                </MenuItem>
                            </Menu>
                        </div>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box component="main">
                <Toolbar />
            </Box>
        </Box>
    );
}
