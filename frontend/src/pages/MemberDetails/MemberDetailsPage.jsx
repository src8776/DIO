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
  Button,
} from "@mui/material";
import Grid from '@mui/material/Grid2';

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

const MemberDetailsModal = ({ memberData }) => {
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
    AttendanceHistory,
  } = memberData || {};

  return (
    <Container>
      <Paper sx={ style }>
        {/* Basic Info */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          Member Details
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
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
          </Grid>
          <Grid xs={12} sm={6}>
            <Typography variant="subtitle1">
              <strong>Email:</strong> {Email}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Major:</strong> {Major}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Status:</strong> {IsActive ? "Active" : "Inactive"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Graduation Year:</strong> {GraduationYear}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Academic Year:</strong> {AcademicYear}
            </Typography>
          </Grid>
        </Grid>

        {/* Attendance History */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Attendance History
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Event</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {AttendanceHistory && AttendanceHistory.length > 0 ? (
                AttendanceHistory.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.event}</TableCell>
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

export default MemberDetailsModal;