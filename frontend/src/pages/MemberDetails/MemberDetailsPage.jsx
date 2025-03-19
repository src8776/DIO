import * as React from 'react';
import {
  Container, Typography, Table,
  TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Box,
  Chip, Button, TextField, Dialog,
  DialogActions, DialogContent, DialogTitle, Select,
  MenuItem, InputLabel, FormControl, Drawer
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';

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

const StatusChip = ({ memberStatus, ...props }) => (
  <Chip
    sx={{
      backgroundColor: memberStatus === 'Active' ? '#e6ffe6' : '#ffe6e6',
      color: memberStatus === 'Active' ? '#2e7d32' : '#c62828',
    }}
    {...props}
  />
);

export default function MemberDetailsModal({ memberID, orgID, memberStatus, selectedSemester }) {
  const [memberInfo, setMemberInfo] = React.useState();
  const [open, setOpen] = React.useState(false);
  const [eventTypeItems, setEventTypeItems] = React.useState([]);
  const semesterID = selectedSemester?.SemesterID || null;
  const semesterStart = selectedSemester?.StartDate || null;
  const semesterEnd = selectedSemester?.EndDate || null;
  const [eventDate, setEventDate] = React.useState(() => { //making sure date is in the semester
    const today = dayjs();
    if (semesterStart && semesterEnd) {
      const start = dayjs(semesterStart);
      const end = dayjs(semesterEnd);
      if (today.isBefore(start)) {
        return start;
      } else if (today.isAfter(end)) {
        return end;
      } else {
        return today;
      }
    }
    return today; // Fallback if semester dates are unavailable
  }); // eventDate defaults to today's date
  const [formData, setFormData] = React.useState({
    memberID: memberID,
    organizationID: orgID,
    semesterID: semesterID,
    eventType: '',
    eventDate: eventDate,
    eventTitle: '',
    attendanceStatus: '',
    attendanceSource: 'manual adjustment',
    hours: null
  });


  React.useEffect(() => {
    if (!memberID || !orgID) return;
    let url = `/api/memberDetails/detailsBySemester?memberID=${memberID}&organizationID=${orgID}`;
    if (selectedSemester) {
      url += `&termCode=${selectedSemester.TermCode}`;
    }
    fetch(url)
      .then(response => response.json())
      .then(data => setMemberInfo(data))
      .catch(error => console.error('Error fetching data for MemberInfo:', error));
  }, [memberID, orgID, selectedSemester]);

  // Only fetch if we have both orgID and semesterID
  React.useEffect(() => {
    if (orgID && semesterID) {
      fetch(`/api/admin/events?organizationID=${orgID}&semesterID=${semesterID}`)
        .then((response) => response.json())
        .then((data) => setEventTypeItems(data))
        .catch((error) => console.error('Error fetching events:', error));
    }
  }, [orgID, semesterID]);

  const handleSubmit = () => {
    const formattedEventDate = formData.eventDate.format('YYYY-MM-DD');
    fetch('/api/memberDetails/addIndividualAttendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...formData,
        eventDate: formattedEventDate,
        hours: formData.eventType === 'Volunteer Event' ? formData.hours : null
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setOpen(false);
        fetch(`/api/memberDetails/detailsBySemester?memberID=${memberID}&organizationID=${orgID}&termCode=${selectedSemester.TermCode}`)
          .then(response => response.json())
          .then(data => setMemberInfo(data));
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, eventDate: date });
  };

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
    Major, GraduationYear, AcademicYear, attendanceRecords,
    RoleName, ShirtSize, PantSize, Gender, Race
  } = memberInfo[0];

  return (
    <Container>
      <Paper sx={style}>
        <Box sx={{ overflowY: 'auto', p: 2 }}>
          {/* Header Section */}
          {/* TODO: Make this section sticky */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {FirstName} {LastName} • <StatusChip
                  label={memberStatus}
                  memberStatus={memberStatus}
                  size="medium"
                />
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: .5 }}>
                {RoleName} • MemberID: {MemberID}
              </Typography>
            </Box>
            <Typography variant="h6">
              {selectedSemester ? selectedSemester.TermName : "all semesters"}
            </Typography>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Personal and Academic Info */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
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
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                  <Typography variant="body2">
                    <strong>Shirt Size:</strong> {ShirtSize || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Pant Size:</strong> {PantSize || "N/A"}
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
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  Attendance History
                </Typography>
                <Button variant="outlined" startIcon={<EditIcon />} onClick={handleClickOpen}>
                  Edit Attendance
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 300 }}>
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
                      attendanceRecords
                        .sort((a, b) => new Date(b.CheckInTime) - new Date(a.CheckInTime))
                        .map((record, index) => (
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
      {/* Add Attendance Dialog */}
      <Dialog open={open} onClose={handleClose} >
        <DialogTitle>Add Attendance</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', p: 2 }}>
          {/* Event Type */}
          <FormControl required fullWidth sx={{ flex: 1 }}>
            <InputLabel id="event-type-select-label">Event Type</InputLabel>
            <Select
              labelId="event-type-select-label"
              id="event-type-select"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              label="Event Type"
              sx={{ minWidth: '200px' }}
            >
              {eventTypeItems.map((item) => (
                <MenuItem key={item.EventTypeID} value={item.EventType}>
                  {item.EventType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Event Title */}
          <TextField
            label="Event Title (optional)"
            name="eventTitle"
            value={formData.eventTitle}
            onChange={handleChange}
            fullWidth
          />
          {/* Event Date */}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Event Date"
              value={formData.eventDate}
              onChange={handleDateChange}
              minDate={dayjs(semesterStart)}
              maxDate={dayjs(semesterEnd)}
            />
          </LocalizationProvider>

          {/* Attendance Status (Excused, Attended) */}
          <FormControl required fullWidth sx={{ flex: 1 }}>
            <InputLabel id="attendance-status-select-label">Attendance Status</InputLabel>
            <Select
              labelId="attendance-status-select-label"
              id="attendance-status-select"
              name="attendanceStatus"
              value={formData.attendanceStatus}
              onChange={handleChange}
              label="Attendance Status"
            >
              <MenuItem value="Attended">Attended</MenuItem>
              <MenuItem value="Excused">Excused</MenuItem>
            </Select>
          </FormControl>

          {/* Volunteer Hours */}
          {formData.eventType === 'Volunteer Event' && (
            <FormControl required sx={{ flex: 1 }}>
              <InputLabel id="volunteer-hours-select-label">Volunteer Hours</InputLabel>
              <Select
                labelId="volunteer-hours-select-label"
                id="volunteer-hours-select"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                label="Volunteer Hours"
                size="small"
              >
                {[...Array(9)].map((_, index) => (
                  <MenuItem key={index} value={index + 1}>
                    {index + 1} Hour{index + 1 > 1 ? 's' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined'>Cancel</Button>
          <Button onClick={handleSubmit} variant='contained'>Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};