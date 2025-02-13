import * as React from 'react';
import { Autocomplete, Box, Button, IconButton, Container, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableContainer, TableHead, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import FileUploadButton from '../../components/FileUploadButton';
import { Remove } from '@mui/icons-material';

// TODO: error handling, make sure all fields are filled out when trying to import data

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
    
    
    return (
        <Container >
            <Paper elevation={1} sx={style}>
                <Typography variant="h5">
                    New Event Form
                </Typography>

                {/* Form Elements */}
                <Box component={"form"} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                    <FormControl required fullWidth>
                        <InputLabel>Event Type</InputLabel>
                        <TextField ></TextField>
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
                    <FileUploadButton eventType={eventType} />
                )}

            </Paper>
        </Container>
    );
}