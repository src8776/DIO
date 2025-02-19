import * as React from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import GenerateReportButton from './GenerateReportButton';
import AddMemberModal from '../../components/AddMemberModal';
import UploadFileModal from './UploadFileModal';
import CloseIcon from '@mui/icons-material/Close';

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
    <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2}}>
      {/* NavColumn goes away on mobile and links should appear in hamburger menu */}
      {/* <Box sx={{ display: { xs: 'none', md: 'block' } }}> */}
        {/* <NavColumn pageTitle="Member Database" orgType={orgType} /> */}
      {/* </Box> */}

      <Box elevation={1}>
        {/* Dashboard Content */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Header: Organization Flavor Text & Close Button */}
          {/* TODO: Display the info of the selected organization module (WiC or COMS) */}
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', position: 'relative' }}>
            {/* Flavor Text */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ textAlign: 'left', display: 'inline' }}>
                Member Database -
              </Typography>
              <Typography variant="h7" sx={{ textAlign: 'left', display: 'inline', ml: 1, verticalAlign: 'middle' }}>
                {orgInfo ? orgInfo : "Loading..."}
              </Typography>
            </Box>


            {/* Close Button
            <Button
              sx={{
                width: 'fit-content',
                height: 'fit-content',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
              }}
              component={Link}
              to="/"
              variant="contained"
              disableElevation
            >
              <CloseIcon />
              <Box
                component="span"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Close
              </Box>
            </Button> */}
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
              <UploadFileModal />
              <GenerateReportButton />
            </Box>
            <AddMemberModal />
          </Box>

          {/* Data Table */}
          <Paper elevation={1}>
            <DataTable orgID={orgID} />
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}

export default AdminDash;
