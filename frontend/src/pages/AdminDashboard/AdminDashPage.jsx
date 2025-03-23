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
  const [semesters, setSemesters] = React.useState([]);
  const [selectedSemester, setSelectedSemester] = React.useState(null);
  const [activeSemester, setActiveSemester] = React.useState(null);
  const [memberData, setMemberData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  if (!allowedTypes.includes(org)) {
    return (
      <Typography component={Paper} variant='h1' sx={{ alignContent: 'center', p: 6, m: 'auto' }}>
        Organization Doesn't Exist
      </Typography>
    );
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
          setSelectedSemester(activeSemester);
          setActiveSemester(activeSemester);
        }
      })
      .catch((error) => {
        console.error('Error fetching semesters:', error);
      });
  }, []);

  // Fetch member data when orgID or selectedSemester changes
  React.useEffect(() => {
    if (orgID !== null && selectedSemester !== undefined) {
      setIsLoading(true);
      const endpoint = selectedSemester
        ? `/api/admin/datatableByTerm?organizationID=${orgID}&termCode=${selectedSemester.TermCode}`
        : `/api/admin/datatableAllTerms?organizationID=${orgID}`;
      fetch(endpoint)
        .then((response) => response.json())
        .then((data) => {
          setMemberData(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching member data:', error);
          setIsLoading(false);
        });
    }
  }, [orgID, selectedSemester]);

  // Handle semester selection change
  const handleSemesterChange = (event) => {
    const value = event.target.value;
    if (value === 0) {
      setSelectedSemester(null);
    } else {
      const newSemester = semesters.find(sem => sem.SemesterID === value);
      setSelectedSemester(newSemester);
    }
  };

  // Callback to refresh data after upload
  const handleUploadSuccess = () => {
    if (selectedSemester === null) {
      fetchData();
    } else {
      fetchData(selectedSemester.TermCode);
    }
  };

  const fetchData = (termCode = null) => {
    if (orgID !== null && selectedSemester !== undefined) {
      setIsLoading(true);
      const endpoint = termCode
        ? `/api/admin/datatableByTerm?organizationID=${orgID}&termCode=${termCode}`
        : `/api/admin/datatableAllTerms?organizationID=${orgID}`;
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
    }
  };

  // console.log(memberData[0].AttendanceRecord)

  return (
    <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
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
            value={selectedSemester ? selectedSemester.SemesterID : 0}
            onChange={handleSemesterChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Select Semester' }}
            size='small'
            sx={{ width: 150 }}
          >
            <MenuItem value={0}>All Semesters</MenuItem>
            {semesters.map((sem) => (
              <MenuItem key={sem.SemesterID} value={sem.SemesterID}>
                {sem.TermName}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* User Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <UploadFileModal onUploadSuccess={handleUploadSuccess} selectedSemester={selectedSemester} />
            <GenerateReportButton orgID={orgID} selectedSemester={selectedSemester} />
          </Box>
          <AddMemberModal selectedSemester={selectedSemester} orgID={orgID} />
        </Box>

        {/* Data Table */}
        <Paper elevation={0}>
          <DataTable orgID={orgID} memberData={memberData} isLoading={isLoading} selectedSemester={selectedSemester} activeSemester={activeSemester} />
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminDash;
