import React from "react";
import {
  Container, Typography, Table,
  TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Box,
  Chip,
} from "@mui/material";
import { styled } from '@mui/material/styles';

// TODO: Option to delete attendance records from the attendance history table here if they are an admin
//       - user feedback for deleting records ('this action cannot be undone', 'deleted successfully', etc.)?

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'left',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  width: { xs: '90%', sm: '500px', md: '600px' },
  maxWidth: '100%',
  maxHeight: '95%',
};

const StatusChip = styled(Chip)(({ memberStatus }) => ({
  backgroundColor: memberStatus === 'Active' ? '#e6ffe6' : '#ffe6e6',
  color: memberStatus === 'Active' ? '#2e7d32' : '#c62828',
}));

export default function MemberDetailsModal({ memberID, orgID, memberStatus, isAdmin = false }) {
  const [memberInfo, setMemberInfo] = React.useState();

  React.useEffect(() => {
    if (!memberID || !orgID) return;
    fetch(`/api/memberDetails/allDetails?memberID=${memberID}&organizationID=${orgID}`)
      .then(response => response.json())
      .then(data => setMemberInfo(data))
      .catch(error => console.error('Error fetching data for MemberInfo:', error));
  }, [memberID, orgID]);

  if (!memberInfo || memberInfo.length === 0) {
    return (
      <Container>
        <Paper elevation={0} sx={style}>
          <Box sx={{ overflowY: 'auto', p: 4 }}>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              No member data available.
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  const {
    MemberID, UserName, FirstName, LastName, Email,
    Major, GraduationYear, AcademicYear, attendanceRecords, RoleName
  } = memberInfo[0];

  return (
    <Container>
      <Paper sx={style}>
        <Box sx={{ overflowY: 'auto', p: 4 }}>
          {/* Header Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {FirstName} {LastName} • <StatusChip
                label={memberStatus}
                memberStatus={memberStatus} // Changed from active to memberStatus
                size="medium"
              />
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: .5 }}>
              {RoleName} • MemberID: {MemberID}
            </Typography>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Personal and Academic Info */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              {/* Personal Info */}
              <Paper elevation={2} sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Personal Info
                </Typography>
                <Typography variant="body2">
                  <strong>Username:</strong> {UserName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {Email}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    <strong>Shirt Size:</strong> n/a
                  </Typography>
                  <Typography variant="body2">
                    <strong>Pant Size:</strong> n/a
                  </Typography>
                </Box>
              </Paper>

              {/* Academic Info */}
              <Paper elevation={2} sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Academic Info
                </Typography>
                <Typography variant="body2">
                  <strong>Major:</strong> {Major || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Grad Year:</strong> {GraduationYear || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Academic Year:</strong> {AcademicYear || "N/A"}
                </Typography>
              </Paper>
            </Box>

            {/* Attendance History */}
            <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', p: 2, gap: 1 }}>
              <Typography variant="h6">
                Attendance History
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 200 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow >
                      <TableCell sx={{ fontWeight: 600 }}>Event ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Event Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Check-in</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceRecords && attendanceRecords.length > 0 ? (
                      attendanceRecords.map((record, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{record.EventID}</TableCell>
                          <TableCell>
                            {record.EventType}
                            {record.Hours && (
                              <Chip
                                label={`${record.Hours}h`}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(record.CheckInTime).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No attendance records found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};