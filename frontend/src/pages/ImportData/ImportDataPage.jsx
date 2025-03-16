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
    p: 4,
    height: 'auto',
    overflow: 'auto',
    maxHeight: '90%',
    width: { xs: '90%', sm: '500px', md: '600px' },
    maxWidth: '100%',
};

export default function ImportDataPage({ onUploadSuccess, onClose, semesterID }) {
    const { org } = useParams(); //"wic" or "coms"
    const orgID = org === 'wic' ? 1 : 2;
    const [eventTypeItems, setEventTypeItems] = React.useState([]);
    const [eventType, setEventType] = React.useState('');
    const [eventDate, setEventDate] = React.useState(dayjs()); // eventDate defaults to today's date
    const [volunteerHours, setVolunteerHours] = React.useState('');
    const [selectedMembers, setSelectedMembers] = React.useState([]);
    const [allMembers, setAllMembers] = React.useState([]);
    const [alertMessage, setAlertMessage] = React.useState('');
    const [alertSeverity, setAlertSeverity] = React.useState('success');
    const [openSnackbar, setOpenSnackbar] = React.useState(false);

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
    }, [orgID, semesterID]); // Add semesterID to dependency array

    React.useEffect(() => {
        fetch(`/api/admin/members/names?organizationID=${orgID}`)
            .then((response) => response.json())
            .then((data) => setAllMembers(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, [orgID]);

    return (
        <Container >
            <Paper elevation={0} sx={style}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="h5">
                        Data Import Form
                    </Typography>
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Close
                    </Button>
                </Box>

                {/* Form Elements */}
                <Box component={"form"} sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                    <FormControl required fullWidth >
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


                    {/* Conditionally render Volunteer Hours input */}
                    {eventType === "Volunteer Event" && (
                        <Container disableGutters sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'space-evenly' }}>
                                <FormControl required sx={{ flex: 1 }} >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Event Date"
                                            id="event-date-select"
                                            value={eventDate}
                                            onChange={handleDateChange}
                                        />
                                    </LocalizationProvider>
                                </FormControl>

                                <FormControl required sx={{ flex: 1 }}>
                                    <InputLabel id="volunteer-hours-select-label">Volunteer Hours</InputLabel>
                                    <Select
                                        labelId="volunteer-hours-select-label"
                                        id="volunteer-hours-select"
                                        value={volunteerHours}
                                        onChange={handleVolunteerHoursChange}
                                        label="Volunteer Hours"
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
                                    <Typography variant="h6" sx={{ flex: 1 }}>
                                        Selected Members: {selectedMembers.length}
                                    </Typography>
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

                                </Box>
                                <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>Remove</TableCell>
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
                                                        <TableCell>{member.hours}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton onClick={() => removeMemberFromList(member.MemberID)}
                                                                sx={{
                                                                    color: 'red',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(255, 0, 0, 0.1)'
                                                                    },
                                                                }}>
                                                                <Remove />
                                                            </IconButton>
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
                        <FileUploadButton orgID={orgID} eventType={eventType} onUploadSuccess={onUploadSuccess} onClose={onClose} />
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