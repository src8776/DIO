import * as React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import { Toolbar, Typography, IconButton } from '@mui/material';

const drawerWidth = 240;

// Links for the navigation bar
const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Admin Dashboard', path: '/admin' },
    // { name: 'Account Setup', path: '/acctSetup' },
    // { name: 'Member Details', path: '/memberDetails' },
    // { name: 'Organization Setup', path: '/organizationSetup' },
    // { name: 'Add New Member', path: '/addMember'}

];

//toggleTheme and mode defined in App.jsx
export default function DrawerAppBar({ toggleTheme, mode }) {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    RIT | DIO
                </Link>
            </Typography>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton sx={{ textAlign: 'center' }}>
                            <Link to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {item.name}
                            </Link>
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem sx={{position:'fixed', bottom:'0'}}>
                    <IconButton color="inherit" onClick={toggleTheme}>
                        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
                    </IconButton>
                </ListItem>
            </List>
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
                        {navItems.map((item) => (
                            <Button key={item.name} component={Link} to={item.path} sx={{ color: '#fff' }}>
                                {item.name}
                            </Button>
                        ))}
                        {/*Toggle button for light/dark mode*/}
                        <IconButton color="inherit" onClick={toggleTheme}>
                            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box component="main" sx={{ p: 0 }}>
                <Toolbar />
            </Box>
        </Box>
    );
}
