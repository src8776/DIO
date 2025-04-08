import * as React from 'react';
import {
  useTheme, Container, Typography, Paper, Box,
  Chip, Button, Dialog, DialogActions,
  DialogContent, DialogContentText,
  DialogTitle, IconButton
} from "@mui/material";
import { normalizeTermCode } from '../../utils/normalizeTermCode';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import SnackbarAlert from '../../components/SnackbarAlert';
import AttendanceHistoryAdmin from './AttendanceHistoryAdmin';
import ExemptStatusToggle from './ExemptStatusToggle';



export default function MemberDetailsPage({
  memberID, orgID, memberStatus, selectedSemester, onMemberUpdate, onClose, onAttendanceUpdate
}) {
  const [memberInfo, setMemberInfo] = React.useState(null);
  const [editMode, setEditMode] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = React.useState(null);
  const [semesters, setSemesters] = React.useState([]);
  const [activeSemester, setActiveSemester] = React.useState(null);
  const [eventTypeItems, setEventTypeItems] = React.useState([]);
  const semesterID = selectedSemester?.SemesterID || null;
  const semesterStart = selectedSemester?.StartDate || null;
  const semesterEnd = selectedSemester?.EndDate || null;
  const [formData, setFormData] = React.useState({
    memberID: memberID,
    organizationID: orgID,
    semesterID: semesterID,
    eventType: '',
    eventDate: dayjs(),
    eventTitle: '',
    attendanceStatus: '',
    attendanceSource: 'manual adjustment',
    hours: null
  });
  const [exemptEnabled, setExemptEnabled] = React.useState(false);
  const [exemptStartSemester, setExemptStartSemester] = React.useState('');
  const [exemptDuration, setExemptDuration] = React.useState(1);
  const [exemptSemesters, setExemptSemesters] = React.useState([]);
  const [snackbar, setSnackbar] = React.useState({ open: false, severity: 'success', message: '' });
  const effectiveStatus = memberInfo && memberInfo[0]?.status ? memberInfo[0].status : memberStatus;
  const theme = useTheme();

  console.log('effective status:', effectiveStatus);
  const StatusChip = ({ memberStatus, ...props }) => {
    let displayedStatus = memberStatus;
    let backgroundColor, textColor;

    switch (memberStatus) {
      case 'Active':
        displayedStatus = 'Active';
        backgroundColor = ' #e6ffe6';
        textColor = theme.palette.activeStatus.default;
        break;
      case 'CarryoverActive':
        displayedStatus = 'Active*';
        backgroundColor = ' #e6ffe6';
        textColor = theme.palette.activeStatus.default;
        break;
      case 'Exempt':
        displayedStatus = 'Exempt';
        backgroundColor = '#e1bee7';
        textColor = theme.palette.exemptStatus.default;
        break;
      case 'N/A':
        displayedStatus = 'N/A';
        backgroundColor = '#ffe6e6';
        textColor = theme.palette.generalStatus.default;
        break;
      case 'Alumni':
        displayedStatus = 'Alumni';
        backgroundColor = '#eecc0e';
        textColor = '#000000';
        break;
      default:
        displayedStatus = 'General';
        backgroundColor = '#fffff';
        textColor = theme.palette.generalStatus.default;
        break;
    }

    return <Chip label={displayedStatus} sx={{ backgroundColor, color: textColor }} {...props} />;
  };
  console.log('member status:', memberStatus);

  // Fetch semesters
  React.useEffect(() => {
    fetch('/api/admin/getSemesters')
      .then(response => response.json())
      .then(data => {
        setSemesters(data);
        const active = data.find(semester => semester.IsActive === 1);
        if (active) setActiveSemester(active);
      })
      .catch(error => console.error('Error fetching semesters:', error));
  }, []);

  // Handle exempt status for 'Exempt' members
  React.useEffect(() => {
    const currentSemesterID = selectedSemester ? selectedSemester.SemesterID : activeSemester?.SemesterID;
    if (currentSemesterID) {
      fetch(`/api/memberDetails/exemptSemesters?memberID=${memberID}&organizationID=${orgID}&semesterID=${currentSemesterID}`)
        .then(resp => resp.json())
        .then(data => {
          setExemptSemesters(data);
          if (Array.isArray(data) && data.length > 0) {
            setExemptEnabled(true);
          } else {
            setExemptEnabled(false);
          }
        })
        .catch(err => console.error("Error fetching exempt semesters:", err));
    }
  }, [memberID, orgID, selectedSemester, activeSemester]);

  // Fetch member data
  React.useEffect(() => {
    if (!memberID || !orgID) return;
    let url = `/api/memberDetails/detailsBySemester?memberID=${memberID}&organizationID=${orgID}`;
    if (selectedSemester) url += `&termCode=${selectedSemester.TermCode}`;
    fetch(url)
      .then(response => response.json())
      .then(data => setMemberInfo(data))
      .catch(error => console.error('Error fetching member info:', error));
  }, [memberID, orgID, selectedSemester]);

  // Fetch event types
  React.useEffect(() => {
    if (orgID && semesterID) {
      fetch(`/api/admin/events?organizationID=${orgID}&semesterID=${semesterID}`)
        .then(response => response.json())
        .then(data => setEventTypeItems(data))
        .catch(error => console.error('Error fetching events:', error));
    }
  }, [orgID, semesterID]);

  // Handlers
  const handleSubmit = () => {
    if (!formData.eventType || !formData.eventDate || !formData.attendanceStatus) {
      setSnackbar({ open: true, severity: 'error', message: 'Please fill out all required fields.' });
      return;
    }

    // Additional volunteer hours check
    if (formData.eventType === 'Volunteer Event' && !formData.hours) {
      setSnackbar({ open: true, severity: 'error', message: 'Please provide volunteer hours.' });
      return;
    }

    if (memberInfo && memberInfo[0]?.attendanceRecords) {
      const duplicate = memberInfo[0].attendanceRecords.some(record =>
        record.EventType === formData.eventType &&
        dayjs(record.CheckInTime).format('YYYY-MM-DD') === formData.eventDate.format('YYYY-MM-DD')
      );
      if (duplicate) {
        setSnackbar({ open: true, severity: 'error', message: 'Attendance record already exists for this event on this day.' });
        return;
      }
    }

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
        setSnackbar({ open: true, severity: 'success', message: 'Attendance record added successfully' });
        if (data.updatedMember && onMemberUpdate) onMemberUpdate(data.updatedMember);
        fetch(`/api/memberDetails/detailsBySemester?memberID=${memberID}&organizationID=${orgID}&termCode=${selectedSemester.TermCode}`)
          .then(response => response.json())
          .then(data => {
            setMemberInfo(data);
            if (onAttendanceUpdate) onAttendanceUpdate(); // analytics dash callback
          });
      })
      .catch(error => {
        console.error('Error:', error);
        setSnackbar({ open: true, severity: 'error', message: 'Error adding attendance record' });
      });
  };

  const handleDeleteClick = (attendance) => {
    setAttendanceToDelete(attendance);
    setConfirmDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setAttendanceToDelete(null);
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
        setSnackbar({ open: true, severity: 'success', message: 'Attendance record removed successfully' });
        if (data.updatedMember && onMemberUpdate) onMemberUpdate(data.updatedMember);
        setConfirmDialogOpen(false);
        setAttendanceToDelete(null);
        fetch(`/api/memberDetails/detailsBySemester?memberID=${memberID}&organizationID=${orgID}&termCode=${selectedSemester.TermCode}`)
          .then(response => response.json())
          .then(data => {
            setMemberInfo(data);
            if (onAttendanceUpdate) onAttendanceUpdate(); // analytics dash callback
          });
      })
      .catch(error => {
        console.error('Error:', error);
        setSnackbar({ open: true, severity: 'error', message: 'Error removing attendance record' });
      });
  };

  const handleExemptSubmit = () => {
    if (!exemptStartSemester) {
      setSnackbar({ open: true, severity: 'error', message: 'Start Semester is required' });
      return;
    }
    fetch('/api/memberDetails/setExemptStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberID,
        organizationID: orgID,
        startSemesterID: parseInt(exemptStartSemester, 10),
        duration: parseInt(exemptDuration, 10)
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setSnackbar({ open: true, severity: 'error', message: data.error });
        } else {
          setSnackbar({ open: true, severity: 'success', message: data.message });
          // Fetch updated member data
          fetch(`/api/memberDetails/detailsBySemester?memberID=${memberID}&organizationID=${orgID}&termCode=${selectedSemester.TermCode}`)
            .then(response => response.json())
            .then(updatedData => {
              setMemberInfo(updatedData);
              if (onMemberUpdate) {
                const updatedMember = {
                  MemberID: memberID,
                  FullName: updatedData[0]?.FullName || 'Unknown',
                  Status: updatedData[0]?.status || 'N/A',
                  AttendanceRecord: updatedData[0]?.attendanceRecords?.length || 0,
                  LastUpdated: new Date().toISOString()
                };
                onMemberUpdate(updatedMember);
              }
              // Refetch exempt semesters
              const currentSemesterID = selectedSemester ? selectedSemester.SemesterID : activeSemester?.SemesterID;
              fetch(`/api/memberDetails/exemptSemesters?memberID=${memberID}&organizationID=${orgID}&semesterID=${currentSemesterID}`)
                .then(resp => resp.json())
                .then(data => setExemptSemesters(data));
            })
            .catch(err => console.error('Error fetching updated member info:', err));
        }
        setExemptEnabled(true);
        setExemptStartSemester('');
        setExemptDuration(1);
      })
      .catch(error => {
        console.error('Error:', error);
        setSnackbar({ open: true, severity: 'error', message: 'Error setting exempt status' });
      });
  };

  const handleUndoExempt = () => {
    const sem = selectedSemester || activeSemester;
    if (!sem) {
      setSnackbar({ open: true, severity: 'error', message: 'No active or selected semester found' });
      return;
    }
    fetch('/api/memberDetails/undoExemptStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberID,
        organizationID: orgID,
        semesterID: sem.SemesterID
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setSnackbar({ open: true, severity: 'error', message: data.error });
        } else {
          setSnackbar({ open: true, severity: 'success', message: data.message });
          // Fetch updated member data
          fetch(`/api/memberDetails/detailsBySemester?memberID=${memberID}&organizationID=${orgID}&termCode=${selectedSemester.TermCode}`)
            .then(response => response.json())
            .then(updatedData => {
              setMemberInfo(updatedData);
              if (onMemberUpdate) {
                const updatedMember = {
                  MemberID: memberID,
                  FullName: updatedData[0]?.FullName || '',
                  Status: updatedData[0]?.status || 'N/A',
                  AttendanceRecord: updatedData[0]?.attendanceRecords?.length || 0,
                  LastUpdated: new Date().toISOString()
                };
                onMemberUpdate(updatedMember);
              }
              // Refetch exempt semesters
              const currentSemesterID = selectedSemester ? selectedSemester.SemesterID : activeSemester?.SemesterID;
              fetch(`/api/memberDetails/exemptSemesters?memberID=${memberID}&organizationID=${orgID}&semesterID=${currentSemesterID}`)
                .then(resp => resp.json())
                .then(data => setExemptSemesters(data));
            })
            .catch(err => console.error('Error fetching updated member info:', err));
        }
      })
      .catch(error => {
        console.error('Error undoing exempt status:', error);
        setSnackbar({ open: true, severity: 'error', message: 'Error undoing exempt status' });
      });
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

  const {
    MemberID: id,
    UserName,
    FirstName,
    LastName,
    Email,
    Major,
    GraduationSemester,
    AcademicYear,
    attendanceRecords,
    RoleName,
    ShirtSize,
    PantSize
  } = memberInfo[0];

  const normalizedGraduationSemester = normalizeTermCode(GraduationSemester);

  return (
    <>
      {/* Full-width Header */}
      <Paper elevation={1} sx={{ width: '100%', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 5, borderRadius: 0 }}>
        <Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, position: 'relative' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {FirstName} {LastName} • <StatusChip memberStatus={effectiveStatus} size="medium" />
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
              {RoleName} • MemberID: {id}
            </Typography>
            <Typography variant="h6" sx={{ mr: 1 }}>
              {selectedSemester ? selectedSemester.TermName : "All Semesters"}
            </Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
              <CloseIcon />
            </IconButton>
          )}
        </Container>
      </Paper>

      <Container sx={{ display: 'flex', flexDirection: 'column', width: '100%', p: 2 }}>
        <Box sx={{}}>

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
                <Typography variant="body2"><strong>Grad Term:</strong> {normalizedGraduationSemester || "N/A"}</Typography>
                <Typography variant="body2"><strong>Academic Year:</strong> {AcademicYear || "N/A"}</Typography>
              </Paper>
            </Box>

            {/* Attendance History */}
            <AttendanceHistoryAdmin
              attendanceRecords={attendanceRecords}
              editMode={editMode}
              setEditMode={setEditMode}
              selectedSemester={selectedSemester}
              onDeleteClick={handleDeleteClick}
              onAddAttendance={handleSubmit}
              formData={formData}
              setFormData={setFormData}
              eventTypeItems={eventTypeItems}
              semesterStart={semesterStart}
              semesterEnd={semesterEnd}
            />
            {(memberStatus === 'Active' || memberStatus === 'CarryoverActive' || memberStatus === 'Exempt') && (
              <ExemptStatusToggle
                exemptEnabled={exemptEnabled}
                setExemptEnabled={setExemptEnabled}
                exemptStartSemester={exemptStartSemester}
                setExemptStartSemester={setExemptStartSemester}
                exemptDuration={exemptDuration}
                setExemptDuration={setExemptDuration}
                exemptSemesters={exemptSemesters}
                memberStatus={effectiveStatus}
                semesters={semesters}
                activeSemester={activeSemester}
                onExemptSubmit={handleExemptSubmit}
                onExemptUndo={handleUndoExempt}
              />
            )}
          </Box>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={handleCancelDelete}>
          <DialogTitle>Delete Attendance Item</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this attendance item?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">No</Button>
            <Button onClick={handleConfirmDelete} color="primary" autoFocus>Yes</Button>
          </DialogActions>
        </Dialog>
        <SnackbarAlert
          message={snackbar.message}
          severity={snackbar.severity}
          open={snackbar.open}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        />
      </Container>
    </>
  );
}