import React, { useState } from 'react';
import { Box, Button, Paper, TextField, MenuItem, Typography } from '@mui/material';

const trackingTypes = [
    { value: 'Hours', label: 'Hours' },
    { value: 'Attendance', label: 'Attendance' },
];

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
    maxHeight: '90%'
};

export default function AddEventForm({ onClose, orgID, refetchEventRules }) {
    const [eventTypeName, setEventTypeName] = useState('');
    const [occurrences, setOccurrences] = useState('');
    const [trackingType, setTrackingType] = useState('Attendance');

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
                    occurrences: parseInt(occurrences, 10) || 0
                }),
            });
    
            const text = await response.text(); // Get raw text first
    
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} - ${text}`);
            }
    
            const data = JSON.parse(text); // Parse only if it’s JSON
            refetchEventRules();
            onClose();
        } catch (error) {
            console.error('Fetch error:', error);
            alert(error.message);
        }
    };

    return (
        <Paper elevation={1} sx={style}>
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