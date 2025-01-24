import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import DataTable from '../../components/DataTable';
import FileUploadButton from '../../components/FileUploadButton';
import GenerateReportButton from '../../components/GenerateReportButton';
import AddMemberButton from '../../components/AddMemberButton';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';

function AdminDash() {

  return (
    <Container>
      <Paper elevation={1}>
        {/* Dashboard Content */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Close Button */}
          <Button
            sx={{ width: 'fit-content' }}
            component={Link}
            to="/"
            variant="contained"
            disableElevation
            startIcon={<CloseIcon />}
          >
            Close
          </Button>

          {/* Organization Flavor Text */}
          {/* TODO: Display the info of the selected organization module (WiC or COMS) */}
          <Box sx={{ position: 'relative' }}>
            <Typography variant="h5" sx={{ textAlign: 'left', display: 'inline' }}>
              Member Database -
            </Typography>
            <Typography sx={{ textAlign: 'left', display: 'inline', ml: 1 }}>
              Computing Organization for Multicultural Students
            </Typography>
            <Typography variant="body2">
              This is a short piece of text about the organization.
            </Typography>
          </Box>

          {/* User Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <FileUploadButton />
              <GenerateReportButton />
            </Box>
            <AddMemberButton />
            </Box>

          {/* Data Table */}
          <Paper elevation={1}>
            <DataTable />
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
}

export default AdminDash;
