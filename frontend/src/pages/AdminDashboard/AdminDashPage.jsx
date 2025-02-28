import * as React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import GenerateReportButton from './GenerateReportButton';
import AddMemberModal from '../../components/AddMemberModal';
import UploadFileModal from './UploadFileModal';
import DataTable from './DataTable';

function AdminDash() {
  const { org } = useParams(); //"wic" or "coms"
  const allowedTypes = ['wic', 'coms'];
  const orgID = org === 'wic' ? 1 : 2;
  const [orgInfo, setOrgInfo] = React.useState(null);
  const [memberData, setMemberData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  if (!allowedTypes.includes(org)) {
    return <Typography variant='h1'>404 page not found</Typography>;
  }

  // Function to fetch member data
  const fetchData = () => {
    setIsLoading(true);
    fetch(`/api/admin/datatable?organizationID=${orgID}`)
      .then((response) => response.json())
      .then((data) => {
        setMemberData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  };

  // Fetch data on component mount
  React.useEffect(() => {
    fetchData();
  }, [orgID]);

  // Fetch organization info
  React.useEffect(() => {
    fetch(`/api/organizationInfo/name?organizationID=${orgID}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setOrgInfo(data[0].Name);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [orgID]);

  // Callback to refresh data after upload
  const handleUploadSuccess = () => {
    fetchData();
  };


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
            <UploadFileModal onUploadSuccess={handleUploadSuccess} />
            <GenerateReportButton />
          </Box>
          <AddMemberModal />
        </Box>

        {/* Data Table */}
        <Paper elevation={0}>
          <DataTable orgID={orgID} memberData={memberData} isLoading={isLoading} />
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminDash;
