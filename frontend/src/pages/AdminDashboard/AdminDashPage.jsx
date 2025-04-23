import * as React from 'react';
import {
  Box, Container, Paper,
  Typography, Select, MenuItem,
  IconButton, Menu, ListItemIcon,
  ListItemText, useTheme, Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import FinalizeSemesterButton from './FinalizeSemesterButton';
import GenerateReportButton from './GenerateReportButton';
import AddMemberModal from '../AddMember/AddMemberModal';
import UploadFileModal from './UploadFileModal';
import DataTable from './DataTable';
import { Edit, EditNote } from '@mui/icons-material';

/**
 * AdminDashPage.jsx
 * 
 * This React component serves as the main dashboard for administrators to manage an organization's data.
 * It provides functionality for viewing and managing member data, uploading files, generating reports,
 * and finalizing semesters. The dashboard dynamically updates based on the selected organization and semester.
 * 
 * Key Features:
 * - Displays a data table of members with options to filter by semester.
 * - Allows administrators to upload files, add members, generate reports, and finalize semesters.
 * - Dynamically fetches and updates data from the backend based on user actions.
 * - Provides a responsive layout for better usability across devices.
 * 
 * Props:
 * - None (uses React Router's `useParams` to determine the organization).
 * 
 * Dependencies:
 * - React, Material-UI components, Material-UI icons, and React Router.
 * - Custom components: FinalizeSemesterButton, GenerateReportButton, AddMemberModal, UploadFileModal, DataTable.
 * 
 * Functions:
 * - handleSemesterChange: Updates the selected semester and fetches corresponding data.
 * - handleUploadSuccess: Refreshes data after a successful file upload or member addition.
 * - fetchData: Fetches member data based on the selected organization and semester.
 * - updateMemberData: Updates the member data in the table after an edit.
 * - isWithinLastMonth: Utility function to check if the current date is within the last month of the active semester.
 * - handleMenuClick & handleMenuClose: Manage the state of the action menu.
 * 
 * Hooks:
 * - React.useState: Manages state for organization ID, semesters, selected semester, member data, loading state, and menu anchor.
 * - React.useEffect: Fetches organization ID, semesters, and member data on component mount or state changes.
 * 
 * @component
 */
function AdminDash() {
  const { org } = useParams(); //"wic" or "coms"
  const theme = useTheme();
  const allowedTypes = ['wic', 'coms'];
  const [orgID, setOrgID] = React.useState(null);
  const [semesters, setSemesters] = React.useState([]);
  const [selectedSemester, setSelectedSemester] = React.useState(null);
  const [activeSemester, setActiveSemester] = React.useState(null);
  const [memberData, setMemberData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openAddMember, setOpenAddMember] = React.useState(false);
  const [openGenerateReport, setOpenGenerateReport] = React.useState(false);
  const [openFinalizeSemester, setOpenFinalizeSemester] = React.useState(false);


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

  const updateMemberData = (updatedMember) => {
    setMemberData((prevData) =>
      prevData.map((member) =>
        member.MemberID === updatedMember.MemberID ? updatedMember : member
      )
    );
  };

  // Utility: check if current date is within the last month of active semester
  const isWithinLastMonth = () => {
    if (!activeSemester || !activeSemester.EndDate) return false;
    const now = new Date();
    const semesterEnd = new Date(activeSemester.EndDate);
    const msInMonth = 30 * 24 * 60 * 60 * 1000;
    return semesterEnd > now && (semesterEnd - now) <= msInMonth;
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // CSV export handler
  const handleExportCSV = () => {
    if (!memberData || memberData.length === 0) {
      alert('No data to export.');
      return;
    }
    // Exclude 'LastUpdated' from header and rows
    let header = Object.keys(memberData[0]).filter(key => key !== 'LastUpdated');
    // If not filtering by semester, also exclude 'Status'
    if (!selectedSemester) {
      header = header.filter(key => key !== 'Status');
    }
    // Sort by MemberID
    const sortedData = [...memberData].sort((a, b) => {
      if (a.MemberID < b.MemberID) return -1;
      if (a.MemberID > b.MemberID) return 1;
      return 0;
    });
    const replacer = (key, value) => (value === null ? '' : value);
    const csv = [
      header.join(','),
      ...sortedData.map(row =>
        header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_${selectedSemester ? selectedSemester.TermName.replace(/\s+/g, '_') : 'all'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <UploadFileModal onUploadSuccess={handleUploadSuccess} selectedSemester={selectedSemester} />
          </Box>
          {/* collapse these buttons to the right  */}

          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>


        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setOpenAddMember(true);
            }}
            sx={{ color: 'primary.main', fontWeight: 'bold' }}
          >
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Add Member" />
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setOpenGenerateReport(true);
            }}
            sx={{ color: 'primary.main', fontWeight: 'bold' }}
          >
            <ListItemIcon>
              <EditNoteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Quick Report" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleExportCSV();
            }}
            sx={{ color: 'primary.main', fontWeight: 'bold' }}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Export CSV" />
          </MenuItem>
          <Divider />
          {/* {isWithinLastMonth() && ( */}
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setOpenFinalizeSemester(true);
            }}
            sx={{ color: 'error.main', fontWeight: 'bold' }}
            disabled={!selectedSemester}
          >
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Finalize Semester" />
          </MenuItem>
          {/* )} */}
        </Menu>

        <GenerateReportButton
          orgID={orgID}
          selectedSemester={selectedSemester}
          open={openGenerateReport}
          onClose={() => setOpenGenerateReport(false)}
          buttonProps={{ style: { display: 'none' } }} // Hide the default button
        />

        <AddMemberModal
          open={openAddMember}
          onClose={() => setOpenAddMember(false)}
          selectedSemester={selectedSemester}
          orgID={orgID}
          onUploadSuccess={() => {
            handleUploadSuccess();
            setOpenAddMember(false);
          }}
          buttonProps={{ style: { display: 'none' } }} // Hide the default button
        />

        <FinalizeSemesterButton
          orgID={orgID}
          selectedSemester={selectedSemester}
          open={openFinalizeSemester}
          onClose={() => setOpenFinalizeSemester(false)}
          buttonProps={{ style: { display: 'none' } }}
        />

        {/* Data Table */}
        <Paper elevation={0}>
          <DataTable
            orgID={orgID}
            memberData={memberData}
            isLoading={isLoading}
            selectedSemester={selectedSemester}
            activeSemester={activeSemester}
            onMemberUpdate={updateMemberData}
          />
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminDash;
