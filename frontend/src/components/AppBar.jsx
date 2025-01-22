import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function ButtonAppBar() {
  return (
    <Box>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            RIT | Diversity Initiatives Office
          </Typography>
          {/* TODO: Make this close the dashboard */}
          <Button 
            variant='contained'
            color='white'
            disableElevation
            startIcon={<CloseIcon/>}>
            
              close
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
