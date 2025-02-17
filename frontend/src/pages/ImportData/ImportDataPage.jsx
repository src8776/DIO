import React from 'react';
import { useParams } from 'react-router-dom';
import { Autocomplete, Box, Button, IconButton, Container, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableContainer, TableHead, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import FileUploadButton from '../../components/FileUploadButton';
import { Remove } from '@mui/icons-material';

// TODO: populate menuItems from database
// TODO: error handling, make sure all fields are filled out when trying to import data
// TODO: Set up the upload volunteer hours button to add the volunteer hours to the appropriate member accounts

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

export default function ImportDataPage() {
    const { org } = useParams(); //"wic" or "coms"
    const orgID = org === 'wic' ? 1 : 2;
    const [eventTypeItems, setEventTypeItems] = React.useState([]);
    const [eventType, setEventType] = React.useState('');
    const [eventDate, setEventDate] = React.useState(dayjs()); // eventDate defaults to today's date
    const [volunteerHours, setVolunteerHours] = React.useState('');
    const [selectedMembers, setSelectedMembers] = React.useState([]);

    const handleEventTypeChange = (event) => {
        setEventType(event.target.value);
    }

    const handleDateChange = (date) => {
        setEventDate(date);  // `date` will be a `dayjs` object
    };

    const handleVolunteerHoursChange = (event) => {
        setVolunteerHours(event.target.value);
    };

    const addMemberToList = (member) => {
        if (!selectedMembers.some(m => m.id === member.id)) {
            setSelectedMembers([...selectedMembers, { ...member, date: eventDate, hours: volunteerHours }]);
        }
    };

    const removeMemberFromList = (memberId) => {
        setSelectedMembers(selectedMembers.filter(member => member.id !== memberId));
    };

    const logMembers = () => {
        console.log('Volunteer Hours Log:');
        selectedMembers.forEach(member => {
            console.log(`Member: ${member.name}, Date Volunteered: ${member.date}, Hours Volunteered: ${member.hours}`);
        });
    };

    React.useEffect(() => {
        fetch(`/api/admin/events?organizationID=${orgID}`)
          .then((response) => response.json())
          .then((data) => setEventTypeItems(data))
          .catch((error) => console.error("Error fetching data:", error));
      }, []);

    // TODO: populate menuItems from database
    //const menuItems = [
        //"Committee Meeting",
        //"General Meeting",
        //"Mentor Event",
        //"Social Event",
        //"Volunteer Event",
        //"Workshop",
    //];

    // TODO: pull members from database (maybe filter for members from the current semester)
    const members = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Alice Johnson' },
        { id: 4, name: 'Bob Brown' },
    ];

    return (
        <Container >
            <Paper elevation={1} sx={style}>
                <Typography variant="h5">
                    Data Import Form
                </Typography>

                {/* Form Elements */}
                <Box component={"form"} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                    <FormControl required fullWidth>
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
                        <Container sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControl required fullWidth>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Event Date"
                                        id="event-date-select"
                                        value={eventDate}
                                        onChange={handleDateChange}
                                        sx={{ flex: 1 }}
                                    />
                                </LocalizationProvider>
                            </FormControl>

                            <FormControl required fullWidth>

                                <InputLabel id="volunteer-hours-select-label">Volunteer Hours</InputLabel>
                                <Select
                                    labelId="volunteer-hours-select-label"
                                    id="volunteer-hours-select"
                                    value={volunteerHours}
                                    onChange={handleVolunteerHoursChange}
                                    label="Volunteer Hours"
                                    sx={{ minWidth: '200px' }}
                                >
                                    {[...Array(9)].map((_, index) => (
                                        <MenuItem key={index} value={index + 1}>
                                            {index + 1} Hour{index + 1 > 1 ? 's' : ''}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl required fullWidth>

                                {/* Autocomplete for Member Selection */}
                                <Autocomplete
                                    options={members}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(event, value) => {
                                        // Only add to the list if value is not null or undefined
                                        if (value) {
                                            addMemberToList(value);
                                        }
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Add Member" />}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    sx={{ marginBottom: 2 }}
                                />
                            </FormControl>

                            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                                Selected Members
                            </Typography>
                            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Member</TableCell>
                                            <TableCell align="center">Remove</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedMembers.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell>{member.name}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => removeMemberFromList(member.id)}>
                                                        <Remove />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Container>
                    )}
                </Box>
                {/* Show "Upload Volunteer Hours" button if the event type is Volunteer Event */}

                {eventType === "Volunteer Event" ? (
                    // TODO: Set this up to upload the data provided by the user into the database
                    <Button variant="contained" color="primary" onClick={logMembers}>
                        Upload Volunteer Hours
                    </Button>
                ) : (
                    // Show FileUploadButton for other event types
                    <FileUploadButton orgID={orgID} eventType={eventType} />
                )}

            </Paper>
        </Container>
    );
}