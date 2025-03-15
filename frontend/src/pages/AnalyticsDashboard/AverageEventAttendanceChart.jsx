import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography, Paper, Button, Box } from '@mui/material';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';

export default function AverageEventAttendanceChart({ organizationID, selectedSemester }) {
    const [averages, setAverages] = React.useState(null);
    const [viewMode, setViewMode] = React.useState('averages');
    const [selectedEventType, setSelectedEventType] = React.useState(null);
    const [eventInstances, setEventInstances] = React.useState(null);

    // Fetch average attendance data
    React.useEffect(() => {
        if (selectedSemester && selectedSemester.SemesterID) {
            fetch(`/api/analytics/averageAttendance?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setAverages(data);
                })
                .catch((error) => {
                    console.error('Error fetching averages:', error);
                });
        } else {
            setAverages(null); // Reset averages if semester is invalid
        }
    }, [organizationID, selectedSemester?.SemesterID]);

    // Fetch event instance attendance data when an event type is selected
    React.useEffect(() => {
        if (viewMode === 'instances' && selectedEventType) {
            fetch(`/api/analytics/eventInstanceAttendance?eventTypeID=${selectedEventType.EventTypeID}&semesterID=${selectedSemester.SemesterID}&organizationID=${organizationID}`)
                .then((response) => response.json())
                .then((data) => {
                    setEventInstances(data);
                })
                .catch((error) => {
                    console.error('Error fetching event instances:', error);
                });
        } else {
            setEventInstances(null); // Reset eventInstances if conditions aren't met
        }
    }, [viewMode, selectedEventType, organizationID, selectedSemester?.SemesterID]);

    // Loading state for averages
    if (!selectedSemester || !averages) {
        return <div>Loading...</div>;
    }

    // Averages view
    if (viewMode === 'averages' && Array.isArray(averages)) {
        const eventTypes = averages.map(item => item.EventType);
        const attendanceRates = averages.map(item => parseFloat(item.averageAttendanceRate) * 100);

        return (
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Average Attendance per Event Type</Typography>
                <BarChart
                    xAxis={[{ id: 'barCategories', data: eventTypes, scaleType: 'band', label: 'Event Type' }]}
                    yAxis={[{ id: 'percentage', min: 0, max: 100, label: 'Attendance Rate (%)' }]}
                    series={[{
                        data: attendanceRates,
                        color: '#F76902',
                        valueFormatter: (value) => value != null ? `${value.toFixed(3)}%` : 'N/A'
                    }]}
                    onAxisClick={(event, params) => {
                        const selectedItem = averages[params.dataIndex];
                        setSelectedEventType(selectedItem);
                        setViewMode('instances');
                    }}
                    barLabel={(item) => {
                        if ((item.value ?? 0) > 30) {
                            return `${Math.floor(item.value)}%`;
                        }
                        return null;
                    }}
                    width={730}
                    height={255}
                    sx={{
                        '& .MuiBarLabel-root': {
                            fontSize: '1.8rem',
                            fill: '#fff',
                        },
                    }}
                />
            </Paper>
        );
    }
    // Instances view
    else if (viewMode === 'instances' && eventInstances) {
        const instanceLabels = eventInstances.map(instance => {
            const date = new Date(instance.EventDate);
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const day = date.getDate();
            return `${month}\n${day}`; // Add newline between month and day
        });
        const instanceRates = eventInstances.map(instance => instance.attendanceRate * 100);

        return (
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                    <Button variant='outlined' size='small' startIcon={<KeyboardBackspaceRoundedIcon />} onClick={() => setViewMode('averages')}>Back to Averages</Button>
                    <Typography>Attendance for {selectedEventType.EventType}s, {selectedSemester.TermName}</Typography>
                </Box>
                <BarChart
                    xAxis={[{
                        id: 'instanceCategories',
                        data: instanceLabels,
                        scaleType: 'band',
                        tickLabelStyle: { fontSize: 12, textAnchor: 'middle' }
                    }]}
                    yAxis={[{ id: 'percentage', min: 0, max: 100, label: 'Attendance Rate (%)' }]}
                    series={[{
                        data: instanceRates,
                        color: '#F76902',
                        valueFormatter: (value) => value != null ? `${value.toFixed(2)}%` : 'N/A'
                    }]}
                    barLabel={(item) => {
                        if ((item.value ?? 0) > 20) {
                            return `${Math.floor(item.value)}%`;
                        }
                        return null;
                    }}
                    width={730}
                    height={255}
                    sx={{
                        '& .MuiBarLabel-root': {
                            fontSize: '.8rem',
                            fill: '#fff',
                        },
                    }}
                />
            </Paper>
        );
    }
    // Loading state for event instances
    else {
        return <div>Loading event instances...</div>;
    }
}