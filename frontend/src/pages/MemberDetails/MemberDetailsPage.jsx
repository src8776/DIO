import * as React from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Box, Chip, Button, Select, MenuItem,
  InputLabel, FormControl, Drawer, TextField, IconButton, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';

const StatusChip = ({ memberStatus, ...props }) => (
  <Chip
    sx={{
      backgroundColor: memberStatus === 'Active' ? '#e6ffe6' : '#ffe6e6',
      color: memberStatus === 'Active' ? '#2e7d32' : '#c62828',
    }}
    {...props}
  />
);

export default function MemberDetailsPage({ memberID, orgID, memberStatus, selectedSemester }) {
  const [memberInfo, setMemberInfo] = React.useState();
  const [open, setOpen] = React.useState(false);
  const [eventTypeItems, setEventTypeItems] = React.useState([]);
  const [editMode, setEditMode] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = React.useState(null);
  const semesterID = selectedSemester?.SemesterID || null;
  const semesterStart = selectedSemester?.StartDate || null;
  const semesterEnd = selectedSemester?.EndDate || null;
  const [eventDate, setEventDate] = React.useState(() => {
    const today = dayjs();
    if (semesterStart && semesterEnd) {
      const start = dayjs(semesterStart);
      const end = dayjs(semesterEnd);
      if (today.isBefore(start)) return start;
      else if (today.isAfter(end)) return end;
      else return today;
    }
    return today;
  });
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

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDateChange = (date) => setFormData({ ...formData, eventDate: date });
  const handleEditToggle = () => setEditMode(!editMode);
  const handleDeleteClick = (attendance) => {
    setAttendanceToDelete(attendance);
    setConfirmDialogOpen(true);
  };
  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setAttendanceToDelete(null);
  };

  // Fetch member data 
  React.useEffect(() => {
    if (!memberID || !orgID) return;
    let url = `/api/memberDetails/detailsBySemester?memberID=${memberID}&organizationID=${orgID}`;
    if (selectedSemester) url += `&termCode=${selectedSemester.TermCode}`;
    fetch(url)
      .then(response => response.json())
      .then(data => setMemberInfo(data))
      .catch(error => console.error('Error fetching data for MemberInfo:', error));
  }, [memberID, orgID, selectedSemester]);

  // Fetch event types 
  React.useEffect(() => {
    if (orgID && semesterID) {
      fetch(`/api/admin/events?organizationID=${orgID}&semesterID=${semesterID}`)
        .then((response) => response.json())
        .then((data) => setEventTypeItems(data))
        .catch((error) => console.error('Error fetching events:', error));
    }
  }, [orgID, semesterID]);

  // Form handling functions 
  const handleSubmit = () => {
    const formattedEventDate = formData.eventDate.format('YYYY-MM-DD');
    fetch('/api/memberDetails/addIndividualAttendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      .catch(error => console.error('Error:', error));
  };

  const handleConfirmDelete = () => {
    fetch('/api/memberDetails/removeIndividualAttendance', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attendanceID: attendanceToDelete.AttendanceID,
        memberID: memberID,
        eventID: attendanceToDelete.EventID,
        organizationID: orgID,
        semester: selectedSemester
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Deleted:', data);
        setConfirmDialogOpen(false);
        setAttendanceToDelete(null);
        fetch(`/api/memberDetails/detailsBySemester?memberID=${memberID}&organizationID=${orgID}&termCode=${selectedSemester.TermCode}`)
          .then(response => response.json())
          .then(data => setMemberInfo(data));
      })
      .catch(error => console.error('Error:', error));
  };


  if (!memberInfo || memberInfo.length === 0) {
    return (
      <Container>
        <Paper elevation={0} sx={{ display: 'flex', flexDirection: 'column', width: '100%', p: 4 }}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            No member data available.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const { MemberID, UserName, FirstName, LastName, Email,
    Major, GraduationYear, AcademicYear, attendanceRecords,
    RoleName, ShirtSize, PantSize, Gender, Race } = memberInfo[0];

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', width: '100%', p: 2}}>

      <Box sx={{}}>
        {/* Header Section */}
        <Box sx={{ mb: 2, pt: 2, display: 'flex', justifyContent: 'space-between', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {FirstName} {LastName} • <StatusChip label={memberStatus} memberStatus={memberStatus} size="medium" />
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: .5 }}>
              {RoleName} • MemberID: {MemberID}
            </Typography>
          </Box>
          <Typography variant="h6">
            {selectedSemester ? selectedSemester.TermName : "All Semesters"}
          </Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Personal and Academic Info */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Paper elevation={1} sx={{ flex: 1, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Personal Info</Typography>
              <Typography variant="body2"><strong>Username:</strong> {UserName}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {Email}</Typography>
              <Typography variant="body2"><strong>Shirt Size:</strong> {ShirtSize || "N/A"}</Typography>
              <Typography variant="body2"><strong>Pant Size:</strong> {PantSize || "N/A"}</Typography>
            </Paper>
            <Paper elevation={1} sx={{ flex: 1, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Academic Info</Typography>
              <Typography variant="body2"><strong>Major:</strong> {Major || "N/A"}</Typography>
              <Typography variant="body2"><strong>Grad Year:</strong> {GraduationYear || "N/A"}</Typography>
              <Typography variant="body2"><strong>Academic Year:</strong> {AcademicYear || "N/A"}</Typography>
            </Paper>
          </Box>

          {/* Attendance History */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Attendance History</Typography>
              {selectedSemester && (
                <Button variant="outlined" startIcon={editMode ? <DoneIcon /> : <EditIcon />} onClick={handleEditToggle}>
                  {editMode ? 'Done Editing' : 'Edit Attendance'}
                </Button>
              )}
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Event ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Event Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Event Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check-in</TableCell>
                    {editMode && <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>}
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
                            {record.Hours && <Chip label={`${record.Hours}h`} size="small" sx={{ ml: 1 }} />}
                          </TableCell>
                          <TableCell>{record.EventTitle || 'N/A'}</TableCell>
                          <TableCell>{new Date(record.CheckInTime).toLocaleString()}</TableCell>
                          {editMode && (
                            <TableCell>
                              <IconButton onClick={() => handleDeleteClick(record)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">No attendance records found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Inline Add Attendance Form */}
            {editMode && (
              <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Add Attendance</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl required fullWidth>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      label="Event Type"
                    >
                      {eventTypeItems.map((item) => (
                        <MenuItem key={item.EventTypeID} value={item.EventType}>{item.EventType}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Event Title (optional)"
                    name="eventTitle"
                    value={formData.eventTitle}
                    onChange={handleChange}
                    fullWidth
                  />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Event Date"
                      value={formData.eventDate}
                      onChange={handleDateChange}
                      minDate={dayjs(semesterStart)}
                      maxDate={dayjs(semesterEnd)}
                    />
                  </LocalizationProvider>
                  <FormControl required fullWidth>
                    <InputLabel>Attendance Status</InputLabel>
                    <Select
                      name="attendanceStatus"
                      value={formData.attendanceStatus}
                      onChange={handleChange}
                      label="Attendance Status"
                    >
                      <MenuItem value="Attended">Attended</MenuItem>
                      <MenuItem value="Excused">Excused</MenuItem>
                    </Select>
                  </FormControl>
                  {formData.eventType === 'Volunteer Event' && (
                    <FormControl required>
                      <InputLabel>Volunteer Hours</InputLabel>
                      <Select
                        name="hours"
                        value={formData.hours}
                        onChange={handleChange}
                        label="Volunteer Hours"
                        size="small"
                      >
                        {[...Array(9)].map((_, index) => (
                          <MenuItem key={index} value={index + 1}>{index + 1} Hour{index + 1 > 1 ? 's' : ''}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={handleSubmit} variant="contained">Add</Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>


      {/* Attendance Adjustment Drawer
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 400, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Add Attendance</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl required fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                label="Event Type"
              >
                {eventTypeItems.map((item) => (
                  <MenuItem key={item.EventTypeID} value={item.EventType}>{item.EventType}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Event Title (optional)"
              name="eventTitle"
              value={formData.eventTitle}
              onChange={handleChange}
              fullWidth
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Event Date"
                value={formData.eventDate}
                onChange={handleDateChange}
                minDate={dayjs(semesterStart)}
                maxDate={dayjs(semesterEnd)}
              />
            </LocalizationProvider>
            <FormControl required fullWidth>
              <InputLabel>Attendance Status</InputLabel>
              <Select
                name="attendanceStatus"
                value={formData.attendanceStatus}
                onChange={handleChange}
                label="Attendance Status"
              >
                <MenuItem value="Attended">Attended</MenuItem>
                <MenuItem value="Excused">Excused</MenuItem>
              </Select>
            </FormControl>
            {formData.eventType === 'Volunteer Event' && (
              <FormControl required>
                <InputLabel>Volunteer Hours</InputLabel>
                <Select
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  label="Volunteer Hours"
                  size="small"
                >
                  {[...Array(9)].map((_, index) => (
                    <MenuItem key={index} value={index + 1}>{index + 1} Hour{index + 1 > 1 ? 's' : ''}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleClose} variant="outlined" sx={{ mr: 1 }}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">Add</Button>
          </Box>
        </Box>
      </Drawer> */}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Delete Attendance Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this attendance item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}