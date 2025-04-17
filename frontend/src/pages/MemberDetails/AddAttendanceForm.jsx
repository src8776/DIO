import * as React from 'react';
import {
    Typography, Box, Button, Select, MenuItem,
    InputLabel, FormControl, TextField
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

/**
 * AddAttendanceForm.jsx
 * 
 * This React component renders a form for adding attendance records for a specific event.
 * It allows users to input details such as event type, event title, event date, attendance status,
 * and volunteer hours (if applicable). The component validates inputs and ensures the event date
 * falls within the selected semester's date range.
 * 
 * Key Features:
 * - Provides dropdowns for selecting event type and attendance status.
 * - Allows users to input an optional event title.
 * - Includes a date picker for selecting the event date, restricted to the semester's date range.
 * - Displays a volunteer hours dropdown for "Volunteer Event" types.
 * - Handles form submission through a callback function.
 * 
 * Props:
 * - formData: Object containing the current form values.
 * - setFormData: Function to update the form values.
 * - eventTypeItems: Array of event type objects to populate the event type dropdown.
 * - semesterStart: String representing the start date of the semester.
 * - semesterEnd: String representing the end date of the semester.
 * - onSubmit: Function to handle form submission.
 * 
 * Dependencies:
 * - React, Material-UI components, and Day.js for date handling.
 * - Material-UI DatePicker and LocalizationProvider for date selection.
 * 
 * Functions:
 * - handleChange: Updates the form values when a dropdown or text field changes.
 * - handleDateChange: Updates the event date in the form values.
 * 
 * Hooks:
 * - None
 * 
 * @component
 */
export default function AddAttendanceForm({ formData, setFormData, eventTypeItems, semesterStart, semesterEnd, onSubmit }) {
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleDateChange = (date) => setFormData({ ...formData, eventDate: date });

    return (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1}}>
            
            <Typography variant="h6" sx={{ mb: 2 }}>Add Attendance</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl required fullWidth>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        label="Event Type"
                        required
                    >
                        {eventTypeItems.map((item) => (
                            <MenuItem key={item.EventTypeID} value={item.EventType}>{item.EventType}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* this event title textfield doesn't work outside of the admin dashboard context for some reason */}
                <TextField
                    label="Event Title (optional)"
                    name="eventTitle"
                    value={formData.eventTitle}
                    onChange={handleChange}
                    fullWidth
                    onClick={(e) => console.log('TextField clicked', e)}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Event Date"
                        value={formData.eventDate}
                        onChange={handleDateChange}
                        minDate={dayjs(semesterStart)}
                        maxDate={dayjs(semesterEnd)}
                        required
                    />
                </LocalizationProvider>
                <FormControl required fullWidth>
                    <InputLabel>Attendance Status</InputLabel>
                    <Select
                        name="attendanceStatus"
                        value={formData.attendanceStatus}
                        onChange={handleChange}
                        label="Attendance Status"
                        required
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
                            required
                        >
                            {[...Array(9)].map((_, index) => (
                                <MenuItem key={index} value={index + 1}>{index + 1} Hour{index + 1 > 1 ? 's' : ''}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={onSubmit} variant="contained">Add</Button>
                </Box>
            </Box>
        </Box>
    );
}
