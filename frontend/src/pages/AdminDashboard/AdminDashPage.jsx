import * as React from 'react';
import {
  Box, Container, Paper,
  Typography, Select, MenuItem
} from '@mui/material';
import { useParams } from 'react-router-dom';
import GenerateReportButton from './GenerateReportButton';
import AddMemberModal from '../../components/AddMemberModal';
import UploadFileModal from './UploadFileModal';
import DataTable from './DataTable';

function AdminDash() {
  const { org } = useParams(); //"wic" or "coms"
  const allowedTypes = ['wic', 'coms'];
  const [orgID, setOrgID] = React.useState(null);
  const [semester, setSemester] = React.useState('Spring 2025');
  const [memberData, setMemberData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  if (!allowedTypes.includes(org)) {
    return <Typography component={Paper} variant='h1' sx={{ alignContent: 'center', p: 6, m: 'auto' }}>Organization Doesn't Exist</Typography>;
  }

  // Grab oranization ID from the abbreviation value
  React.useEffect(() => {
    fetch(`/api/organizationInfo/organizationIDByAbbreviation?abbreviation=${org}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setOrgID(data[0].OrganizationID);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [org]);

  // Fetch data on component mount
  React.useEffect(() => {
    if (orgID !== null) {
      fetchData();
    }
  }, [orgID]);

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

  // Callback to refresh data after upload
  const handleUploadSuccess = () => {
    fetchData();
  };

  const handleSemesterChange = (event) => {
    setSemester(event.target.value);
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
          {/* Semester Select */}
          <Select
            value={semester}
            onChange={handleSemesterChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Select Semester' }}
            size='small'
            sx={{ width: 150 }}
          >
            <MenuItem value="Fall 2024">Fall 2024</MenuItem>
            <MenuItem value="Spring 2024">Spring 2024</MenuItem>
            <MenuItem value="Spring 2025">Spring 2025</MenuItem>
            <MenuItem value="Fall 2025">Fall 2025</MenuItem>
            <MenuItem value="Spring 2026">Spring 2026</MenuItem>
            <MenuItem value="Fall 2026">Fall 2026</MenuItem>
          </Select>
        </Box>

        {/* User Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <UploadFileModal onUploadSuccess={handleUploadSuccess} />
            <GenerateReportButton orgID={orgID} />
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
