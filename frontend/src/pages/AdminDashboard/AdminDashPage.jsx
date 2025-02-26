import * as React from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import GenerateReportButton from './GenerateReportButton';
import AddMemberModal from '../../components/AddMemberModal';
import UploadFileModal from './UploadFileModal';

import DataTable from './DataTable';

// TODO: Pass org to datatable to select members from the correct organization

function AdminDash() {
  const { org } = useParams(); //"wic" or "coms"
  const allowedTypes = ['wic', 'coms'];
  const orgID = org === 'wic' ? 1 : 2;
  const [orgInfo, setOrgInfo] = React.useState(null);

  if (!allowedTypes.includes(org)) {
    return <Typography variant='h1'>404 page not found</Typography>;
  }

  React.useEffect(() => {
    fetch(`/api/organizationInfo/name?organizationID=${orgID}`)
      .then((response) => response.json())
      .then((data) => {
        // console.log('Fetched data:', data);
        if (data.length > 0) {
          setOrgInfo(data[0].Name); // Extract Name directly
        } else {
          return <Typography variant='h1'>404 page not found</Typography>; // Fallback if no data
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [orgID]);


  return (
    <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      {/* Dashboard Content */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header: Organization Flavor Text & Close Button */}
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {/* Flavor Text */}
          <Box>
            <Typography variant="h5" sx={{ textAlign: 'left', display: 'inline' }}>
              Member Database -
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'left', display: 'inline', ml: 1 }}>
              {org ? org.toUpperCase() : "Loading..."}
            </Typography>
          </Box>
          {/* TODO: Reflect current semester, need to figure out this system */}
          <Typography>Spring Semester, 2025</Typography>
        </Box>

        {/* User Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <UploadFileModal />
            <GenerateReportButton />
          </Box>
          <AddMemberModal />
        </Box>

        {/* Data Table */}
        <Paper elevation={0}>
          <DataTable orgID={orgID} />
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminDash;
