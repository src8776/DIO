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
  const [semester, setSemester] = React.useState('');
  const [semesters, setSemesters] = React.useState([]);
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

  // Fetch semesters on component mount
  React.useEffect(() => {
    fetch('/api/admin/getSemesters')
      .then((response) => response.json())
      .then((data) => {
        setSemesters(data);
        const activeSemester = data.find(semester => semester.IsActive === 1);
        if (activeSemester) {
          setSemester(activeSemester.TermName);
        }
      })
      .catch((error) => {
        console.error('Error fetching semesters:', error);
      });
  }, []);

  // Fetch data on component mount
  React.useEffect(() => {
    if (orgID !== null) {
      fetchData();
    }
  }, [orgID]);

  // Function to fetch member data
  const fetchData = (termCode = null) => {
    setIsLoading(true);
    const endpoint = termCode ? `/api/admin/datatableByTerm?organizationID=${orgID}&termCode=${termCode}` : `/api/admin/datatableAllTerms?organizationID=${orgID}`;
    fetch(endpoint)
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
    const selectedSemester = event.target.value;
    setSemester(selectedSemester);
    if (selectedSemester === "All Semesters") {
      fetchData();
    } else {
      const selectedTermCode = semesters.find(sem => sem.TermName === selectedSemester)?.TermCode;
      fetchData(selectedTermCode);
    }
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
            <MenuItem value="All Semesters">All Semesters</MenuItem>
            {semesters.map((sem) => (
              <MenuItem key={sem.SemesterID} value={sem.TermName}>
                {sem.TermName}
              </MenuItem>
            ))}
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
