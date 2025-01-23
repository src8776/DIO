import { Box, Container, Paper, Typography } from '@mui/material'
import React from 'react'
import DataTable from '../../components/DataTable'
import AppBar from '../../components/AppBar'
import FileUploadButton from '../../components/FileUploadButton'
import GenerateReportButton from '../../components/GenerateReportButton'
import AddMemberButton from '../../components/AddMemberButton'


function AdminDash() {
    return (
        <Container>
          <Paper elevation={1}>
            <AppBar/>

            {/* this box contains all dashboard content */}
            <Box
              sx={{
                p:2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 2
              }}
            >

              {/* this box contains the organization flavor text */}
              {/* TODO: Make this box display the info of whichever organization module you came from (WiC : COMS) */}
              <Box>
                <Typography
                  variant="h5"
                  sx={{ 
                    textAlign: "left", 
                    display: "inline"
                  }}
                >
                  Member Database - 
                </Typography>
                <Typography
                  sx={{ 
                    textAlign: "left", 
                    display: "inline", 
                    ml: 1
                  }}
                >
                  Computing Organization for Multicultural Students
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ color: "black" }}
                >
                  This is a short piece of text about the organization..
                </Typography>
              </Box>

              {/* this box contains the 3 user action buttons (import, generate, add) */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: {
                    xs: 'column',
                    sm: 'row'
                  },
                  justifyContent: 'space-between',
                  gap: 2
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 2,
                  }}
                >
                  <FileUploadButton />
                  <GenerateReportButton />
                </Box>
                <AddMemberButton/>
              </Box>

              <Paper elevation={2}>
                <DataTable/>
              </Paper>

            </Box>
          </Paper>
        </Container>
    );   
}

export default AdminDash;

