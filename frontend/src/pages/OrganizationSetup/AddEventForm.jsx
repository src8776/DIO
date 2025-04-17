import React, { useState } from 'react';
import { Box, Button, Paper, TextField, MenuItem, Typography } from '@mui/material';



/**
 * AddEventForm.jsx
 * 
 * This React component renders a form for adding a new event type to an organization.
 * It allows administrators to specify the event type name, tracking type, and the number of occurrences per semester.
 * The component validates input and submits the event data to the backend for processing.
 * 
 * Key Features:
 * - Provides input fields for event type name, tracking type, and occurrences per semester.
 * - Validates input to ensure required fields are filled.
 * - Submits the event data to the backend and provides feedback on success or failure.
 * - Allows administrators to cancel the operation or close the form.
 * 
 * Props:
 * - onClose: Function to close the form.
 * - orgID: String or number representing the organization ID.
 * - refetchEventRules: Function to refresh the event rules after a successful submission.
 * - setSuccessMessage: Function to display a success message upon successful submission.
 * - semesterID: String or number representing the semester ID.
 * 
 * Dependencies:
 * - React, Material-UI components.
 * 
 * Functions:
 * - handleSubmit: Validates input and submits the event data to the backend.
 * 
 * Hooks:
 * - React.useState: Manages state for event type name, tracking type, and occurrences.
 * 
 * @component
 */
export default function AddEventForm({ onClose, orgID, refetchEventRules, setSuccessMessage, semesterID }) {
    const [eventTypeName, setEventTypeName] = useState('');
    const [occurrences, setOccurrences] = useState('');
    const [trackingType, setTrackingType] = useState('Attendance');

    const trackingTypes = [
        { value: 'Hours', label: 'Hours' },
        { value: 'Attendance', label: 'Attendance' },
    ];
    
    const modalStyle = {
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
        maxHeight: '90%'
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/organizationRules/addEventType', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organizationID: orgID,
                    EventTypeName: eventTypeName,
                    TrackingType: trackingType,
                    occurrences: parseInt(occurrences, 10) || 0,
                    semesterID: semesterID
                }),
            });
    
            const text = await response.text(); // Get raw text first
    
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} - ${text}`);
            }
    
            const data = JSON.parse(text); // Parse only if it’s JSON
            refetchEventRules();
            setSuccessMessage('Event added successfully!');
            onClose();
        } catch (error) {
            console.error('Fetch error:', error);
            alert(error.message);
        }
    };

    return (
        <Paper elevation={1} sx={modalStyle}>
            <Box component={'form'} sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                <Typography variant="h6">Add New Event</Typography>
                <Box>
                    <TextField
                        label="Event Type Name"
                        value={eventTypeName}
                        onChange={(e) => setEventTypeName(e.target.value)}
                        required
                        fullWidth
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ pt: .5 }}>e.g. 'General Meeting'</Typography>
                </Box>
                <Box>
                    <TextField
                        select
                        label="Tracking Type"
                        value={trackingType}
                        onChange={(e) => setTrackingType(e.target.value)}
                        required
                        fullWidth
                    >
                        {trackingTypes.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Typography variant="body2" color="textSecondary" sx={{ pt: .5 }}>
                        Selecting 'Hours' will allow you to include hours when importing attendance data.
                    </Typography>
                </Box>
                <Box>
                    <TextField
                        label="Occurrences Per Semester"
                        type="number"
                        value={occurrences}
                        onChange={(e) => setOccurrences(e.target.value)}
                        fullWidth
                    />
                </Box>
                <Typography>
                    Note: Event settings can be modified later
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={onClose} color="secondary">Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>Add Event</Button>
                </Box>
            </Box>
        </Paper>
    );
}