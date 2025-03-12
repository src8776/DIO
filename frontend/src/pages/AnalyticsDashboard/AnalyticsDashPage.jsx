import * as React from 'react';
import {
  Box, Container, Paper,
  Typography, Select, MenuItem
} from '@mui/material';
import { useParams } from 'react-router-dom';




export default function AnalyticsDash() {
  const { org } = useParams();
  const allowedTypes = ['wic', 'coms'];
  const [orgID, setOrgID] = React.useState(null);
  const [semesters, setSemesters] = React.useState([]);
  const [selectedSemester, setSelectedSemester] = React.useState(null);
  const [activeSemester, setActiveSemester] = React.useState(null);

  if (!allowedTypes.includes(org)) {
    return (
      <Typography component={Paper} variant='h1' sx={{ alignContent: 'center', p: 6, m: 'auto' }}>
        Organization Doesn't Exist
      </Typography>
    );
  }

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

  return (
    <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      {/* TODO: Need to figure out width and standardize across pages */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 832 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <Box>
            <Typography variant="h5" sx={{ textAlign: 'left', display: 'inline' }}>
              Analytics Dashboard -
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'left', display: 'inline', ml: 1 }}>
              {org ? org.toUpperCase() : "Loading..."}
            </Typography>
          </Box>
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

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, border: 'solid red' }}>
          <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', gap: 2, border: 'solid blue' }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography>Total Members</Typography>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography>Overall Attendance</Typography>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', flexGrow: 3, flexDirection: 'column', gap: 2, border: 'solid blue' }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography>Average Attendance per Event Type</Typography>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography>Majors</Typography>
            </Paper>
          </Box>
        </Box>

        <Paper elevation={0}>
          {/* Add your analytics content here */}
        </Paper>
      </Box>
    </Container>
  );
}