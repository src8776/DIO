import React from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box
} from "@mui/material";
import useAccountStatus from "../../hooks/useAccountStatus";

// TODO: Option to delete attendance records from the attendance history table here if they are an admin
//       - user feedback for deleting records ('this action cannot be undone', 'deleted successfully', etc.)? 

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  width: { xs: '90%', sm: '500px', md: '600px' },
  maxWidth: '100%',
};

export default function MemberDetailsModal ({ memberID, orgID }) {
  const { activeRequirement, requirementType, userAttendance, statusObject } = useAccountStatus(orgID, memberID);


  const [memberInfo, setMemberInfo] = React.useState();

  React.useEffect(() => {
    if (!memberID || !orgID) return;
    // console.log('Fetching data for memberID:', memberID, 'and orgID:', orgID);
    fetch(`/api/memberDetails/allDetails?memberID=${memberID}&organizationID=${orgID}`)
      .then(response => response.json())
      .then(data => {
        // console.log('Fetched data:', data);
        setMemberInfo(data);
      })
      .catch(error => console.error('Error fetching data for MemberInfo:', error));
  }, [memberID, orgID]);




  if (!memberInfo || memberInfo.length === 0) {
    return (
      <Container>
        <Paper sx={style}>
          <Typography variant="h6">No member data available.</Typography>
        </Paper>
      </Container>
    );
  }

  const {
    MemberID,
    UserName,
    FirstName,
    LastName,
    Email,
    Major,
    IsActive,
    GraduationYear,
    AcademicYear,
    attendanceRecords,
  } = memberInfo[0]; // Extracting the first item from the array

  return (
    <Container>
      <Paper sx={style}>
        {/* Basic Info */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          Member Details
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          <Box>
            <Typography variant="subtitle1">
              <strong>Member ID:</strong> {MemberID}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Username:</strong> {UserName}
            </Typography>
            <Typography variant="subtitle1">
              <strong>First Name:</strong> {FirstName}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Last Name:</strong> {LastName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1">
              <strong>Email:</strong> {Email}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Major:</strong> {Major || "N/A"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Status:</strong> {statusObject.status}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Graduation Year:</strong> {GraduationYear || "N/A"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Academic Year:</strong> {AcademicYear || "N/A"}
            </Typography>
          </Box>
        </Box>

        {/* Attendance History */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Attendance History
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Event ID</TableCell>
                <TableCell>Check-in Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceRecords && attendanceRecords.length > 0 ? (
                attendanceRecords.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.EventID}</TableCell>
                    <TableCell>{new Date(record.CheckInTime).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};