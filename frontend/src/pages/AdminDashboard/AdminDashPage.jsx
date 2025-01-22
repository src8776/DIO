import { Box, Container, Paper, Typography } from '@mui/material'
import React from 'react'
import DataTable from '../../components/DataTable'
import AppBar from '../../components/AppBar'


function AdminDash() {
    return (
        <Container>
          <AppBar></AppBar>
          <Paper 
            elevation={1}
            sx={{ p:2, pt:1 }}
          >
            {/* TODO: Make this header display the name of whichever organization module you came from (WiC : COMS) */}
            <Typography
                variant="h2"
                sx={{ my: 4, textAlign: "left", color: "primary.main", display: "inline"}}
            >
                Member Database - 
                <Typography
                  sx={{ textAlign: "left", color: "primary.main", display: "inline", ml: 1}}
                >
                 Computing Organization for Multicultural Students
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ color: "black" }}
                >
                  This is a short piece of text about the organization..
                </Typography>
            </Typography>

            <Paper 
              elevation={2}
              // sx={{ m:2 }}
            >
              <DataTable/>
            </Paper>

          </Paper>
        </Container>
    );
    
}

export default AdminDash;

