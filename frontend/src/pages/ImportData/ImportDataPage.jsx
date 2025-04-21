import React from 'react';
import { useParams } from 'react-router-dom';
import {
    Autocomplete, Box, Button,
    IconButton, Container, FormControl,
    InputLabel, MenuItem, Paper,
    Select, Table, TableContainer,
    TableHead, TableBody, TableCell,
    TableRow, TextField, Typography,
    Skeleton
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import FileUploadButton from '../AdminDashboard/FileUploadButton';
import { Remove } from '@mui/icons-material';
import SnackbarAlert from '../../components/SnackbarAlert';

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
    p: 3,
    height: 'auto',
    overflow: 'auto',
    maxHeight: '90%',
    width: { xs: '90%', sm: '500px', md: '600px' },
    maxWidth: '100%',
};

/**
 * ImportDataPage.jsx
 * 
 * This React component provides a form for importing event data and volunteer hours for a selected semester.
 * It allows administrators to upload data files or manually input volunteer hours for selected members.
 * The component dynamically fetches data from the backend and updates the form based on the selected semester.
 * 
 * Key Features:
 * - Fetches and displays event types and member lists for the selected organization and semester.
 * - Allows administrators to input volunteer hours and event details for selected members.
 * - Provides a file upload option for importing data for non-volunteer events.
 * - Displays a table of selected members with options to adjust hours and remove members.
 * - Handles loading states and provides feedback using a SnackbarAlert component.
 * 
 * Props:
 * - onUploadSuccess: Callback function triggered after a successful data upload.
 * - onClose: Function to close the form.
 * - selectedSemester: Object representing the currently selected semester (includes SemesterID, StartDate, EndDate, and TermName).
 * 
 * Dependencies:
 * - React, Material-UI components, Material-UI icons, and Day.js for date handling.
 * - FileUploadButton: A custom component for uploading files.
 * - SnackbarAlert: A custom component for displaying alerts.
 * 
 * Functions:
 * - handleEventTypeChange: Updates the selected event type based on user input.
 * - handleDateChange: Updates the event date based on user input.
 * - handleVolunteerHoursChange: Updates the volunteer hours input.
 * - addMemberToList: Adds a selected member to the list with associated hours and date.
 * - removeMemberFromList: Removes a member from the selected members list.
 * - uploadVolunteerHours: Sends volunteer hours data to the backend for processing.
 * - handleMemberHoursChange: Updates the hours for a specific member in the table.
 * - showAlert: Displays a SnackbarAlert with a message and severity.
 * 
 * Hooks:
 * - React.useState: Manages state for event types, members, selected members, volunteer hours, and UI interactions.
 * - React.useEffect: Fetches event types and member lists when dependencies change.
 * 
 * @component
 */
export default function ImportDataPage({ onUploadSuccess, onClose, selectedSemester }) {
    const { org } = useParams(); //"wic" or "coms"
    const orgID = org === 'wic' ? 1 : 2;
    const [eventTypeItems, setEventTypeItems] = React.useState([]);
    const [eventType, setEventType] = React.useState('');
    const [eventTitle, setEventTitle] = React.useState('');
    const [volunteerHours, setVolunteerHours] = React.useState('');
    const [selectedMembers, setSelectedMembers] = React.useState([]);
    const [allMembers, setAllMembers] = React.useState([]);
    const [alertMessage, setAlertMessage] = React.useState('');
    const [alertSeverity, setAlertSeverity] = React.useState('success');
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const semesterID = selectedSemester?.SemesterID || null;
    const semesterStart = selectedSemester?.StartDate || null;
    const semesterEnd = selectedSemester?.EndDate || null;
    const [eventDate, setEventDate] = React.useState(() => {
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

    const handleCloseSnackbar = () => setOpenSnackbar(false);

    const handleEventTypeChange = (event) => setEventType(event.target.value);

    const handleDateChange = (date) => setEventDate(dayjs(date).startOf('day'));

    const handleVolunteerHoursChange = (event) => setVolunteerHours(event.target.value);



    const showAlert = (message, severity) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setOpenSnackbar(true);
    };

    const addMemberToList = (member) => {
        if (!selectedMembers.some(m => m.MemberID === member.MemberID)) {
            setSelectedMembers([...selectedMembers, { ...member, date: eventDate.format("YYYY-MM-DD"), hours: volunteerHours }]);
        }
    };

    const removeMemberFromList = (memberId) => {
        setSelectedMembers(selectedMembers.filter(member => member.MemberID !== memberId));
    };

    const uploadVolunteerHours = () => {
        if (selectedMembers.length === 0) {
            showAlert('You must select member(s)', 'error');
            return;
        }
        const hasInvalidData = selectedMembers.some((m) => {
            if (m.hours === '' || m.date === '') {
                showAlert('You must select volunteer hours', 'error');
                return true;
            }
            return false;
        });
        if (hasInvalidData) return;

        const data = {
            orgID: orgID,
            eventType: eventType,
            eventTitle: eventTitle,
            members: selectedMembers,
        };

        fetch(`/api/admin/volunteers/hours`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data.success) {
                    const msg = 'Failed to upload volunteer hours due to ' + data.error;
                    showAlert(msg, 'error');
                } else {
                    showAlert('Successfully uploaded volunteer hours', 'success');
                    onUploadSuccess?.();
                }
            })
            .catch((error) => {
                console.error(error);
                showAlert('Unrecoverable error occurred when uploading file. Please contact administrator!', 'error');
            });
    };

    React.useEffect(() => {
        // Only fetch if we have both orgID and semesterID
        if (orgID && semesterID) {
            fetch(`/api/admin/events?organizationID=${orgID}&semesterID=${semesterID}`)
                .then((response) => response.json())
                .then((data) => setEventTypeItems(data))
                .catch((error) => console.error('Error fetching events:', error));
        }
    }, [orgID, semesterID]);

    React.useEffect(() => {
        fetch(`/api/admin/members/names?organizationID=${orgID}`)
            .then((response) => response.json())
            .then((data) => setAllMembers(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, [orgID]);

    // individual hours adjustment inside the table
    const handleMemberHoursChange = (memberId, newHours) => {
        setSelectedMembers(selectedMembers.map(member =>
            member.MemberID === memberId ? { ...member, hours: newHours } : member
        ));
    };

    return (
        <Container >
            <Paper elevation={0} sx={style}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant="h5">
                            Data Import Form
                        </Typography>
                        <Typography variant='h6'>{selectedSemester?.TermName}</Typography>
                    </Box>
                    <Button onClick={onClose} variant="outlined" color="secondary" sx={{ alignSelf: 'flex-start' }}>
                        Close
                    </Button>
                </Box>

                {/* Form Elements */}
                <Box component={"form"} sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
                        <FormControl required fullWidth sx={{ flex: 1 }} >
                            <InputLabel id="event-type-select-label">Event Type</InputLabel>
                            <Select
                                labelId="event-type-select-label"
                                id="event-type-select"
                                value={eventType}
                                onChange={handleEventTypeChange}
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

                        {eventType === "Volunteer Event" && (
                            <FormControl required sx={{ flex: 1 }} >
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Event Date"
                                        id="event-date-select"
                                        value={eventDate}
                                        onChange={handleDateChange}
                                        minDate={dayjs(semesterStart)}
                                        maxDate={dayjs(semesterEnd)}

                                    />
                                </LocalizationProvider>
                            </FormControl>
                        )}
                    </Box>

                    {eventType === "Volunteer Event" && (
                        <TextField
                            label="Event Title (optional)"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            fullWidth
                            sx={{ mt: 2 }}
                        />
                    )}


                    {/* Conditionally render Volunteer Hours input */}
                    {eventType === "Volunteer Event" && (
                        <Container disableGutters sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                            <Typography variant="h6" sx={{ flex: 1 }}>
                                Selected Members: <span style={{ color: '#0366F2' }}>{selectedMembers.length}</span>
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'space-evenly' }}>
                                <FormControl required fullWidth sx={{ flex: 1 }}>
                                    {/* Autocomplete for Member Selection */}
                                    <Autocomplete
                                        size='small'
                                        options={allMembers}
                                        getOptionLabel={(option) => option.FullName}
                                        onChange={(event, value) => {
                                            // Only add to the list if value is not null or undefined
                                            if (value) {
                                                addMemberToList(value);
                                            }
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Add Member" />}
                                        isOptionEqualToValue={(option, value) => option.MemberID === value.MemberID}
                                        disabled={!volunteerHours}
                                    />
                                </FormControl>

                                <FormControl required sx={{ flex: 1 }}>
                                    <InputLabel id="volunteer-hours-select-label">Volunteer Hours</InputLabel>
                                    <Select
                                        labelId="volunteer-hours-select-label"
                                        id="volunteer-hours-select"
                                        value={volunteerHours}
                                        onChange={handleVolunteerHoursChange}
                                        label="Volunteer Hours"
                                        size='small'
                                    >
                                        {[...Array(9)].map((_, index) => (
                                            <MenuItem key={index} value={index + 1}>
                                                {index + 1} Hour{index + 1 > 1 ? 's' : ''}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>


                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, justifyContent: 'space-evenly' }}>


                                </Box>
                                <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600 }}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedMembers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4}>
                                                        <Skeleton variant="rectangular" height={40} sx={{ bgcolor: '#e3f2fd' }} />
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                selectedMembers.map((member) => (
                                                    <TableRow key={member.MemberID}>
                                                        <TableCell>{member.FullName}</TableCell>
                                                        <TableCell>{dayjs(member.date).format("MM/DD/YYYY")}</TableCell>
                                                        <TableCell>
                                                            <FormControl required>
                                                                <Select
                                                                    value={member.hours}
                                                                    onChange={(e) => handleMemberHoursChange(member.MemberID, e.target.value)}
                                                                    size="small"
                                                                >
                                                                    {[...Array(9)].map((_, index) => (
                                                                        <MenuItem key={index} value={index + 1}>
                                                                            {index + 1}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                onClick={() => removeMemberFromList(member.MemberID)}
                                                                variant="outlined"
                                                                color="secondary"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    color: 'red',
                                                                    borderColor: 'red',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                                                        borderColor: 'red',
                                                                    },
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Container>
                    )}
                </Box>
                {eventType === "Volunteer Event" ? (
                    <Button variant="contained" color="primary" onClick={uploadVolunteerHours}>
                        Upload Volunteer Hours
                    </Button>
                ) : (
                    // Show FileUploadButton for other event types
                    <Box sx={{ mt: 2, width: '100%' }}>
                        <FileUploadButton
                            orgID={orgID} eventType={eventType}
                            onUploadSuccess={onUploadSuccess} onClose={onClose}
                            selectedSemester={selectedSemester}
                        />
                    </Box>
                )}
            </Paper>
            <SnackbarAlert
                open={openSnackbar}
                message={alertMessage}
                severity={alertSeverity}
                onClose={handleCloseSnackbar}
            />
        </Container>
    );
}