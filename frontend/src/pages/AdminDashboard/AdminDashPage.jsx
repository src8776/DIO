import React from 'react'
import { Box, Container, Paper, Typography } from '@mui/material'
import Button from '@mui/material/Button';
import DataTable from '../../components/DataTable'
import FileUploadButton from '../../components/FileUploadButton'
import GenerateReportButton from '../../components/GenerateReportButton'
import AddMemberButton from '../../components/AddMemberButton'
import CloseIcon from '@mui/icons-material/Close';

function AdminDash() {
  return (
    <Container>
      <Paper elevation={1}>

        {/* this box contains all dashboard content */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 2
          }}
        >

          {/* this box contains the organization flavor text */}
          {/* TODO: Make this box display the info of whichever organization module you came from (WiC : COMS) */}
          <Box
            sx={{
              position: 'relative'
            }}
          >
            {/* TODO: Make this close the dashboard
              <Button 
                  variant='contained'
                  color='gray'
                  disableElevation
                  startIcon={<CloseIcon/>}>
                  close
              </Button> */}
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
            <AddMemberButton />
          </Box>

          <Paper elevation={1}>
            <DataTable />
          </Paper>

        </Box>
      </Paper>
    </Container>
  );
}

export default AdminDash;

