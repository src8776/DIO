import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography, Paper, Button, Box } from '@mui/material';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';

export default function AverageEventAttendanceChart({ organizationID, selectedSemester }) {
    const [averages, setAverages] = React.useState(null);
    const [viewMode, setViewMode] = React.useState('averages');
    const [selectedEventType, setSelectedEventType] = React.useState(null);
    const [eventInstances, setEventInstances] = React.useState(null);
    const [isFetchingInstances, setIsFetchingInstances] = React.useState(false);

    // Fetch average attendance data
    React.useEffect(() => {
        if (selectedSemester && selectedSemester.SemesterID) {
            fetch(`/api/analytics/averageAttendance?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    // console.log('Average attendance data:', data);
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
        const controller = new AbortController();
        const signal = controller.signal;
    
        if (viewMode === 'instances' && selectedEventType && !isFetchingInstances) {
            setIsFetchingInstances(true);
            fetch(`/api/analytics/eventInstanceAttendance?eventTypeID=${selectedEventType.EventTypeID}&semesterID=${selectedSemester.SemesterID}&organizationID=${organizationID}`, { signal })
                .then((response) => response.json())
                .then((data) => {
                    setEventInstances(data);
                    setIsFetchingInstances(false);
                })
                .catch((error) => {
                    if (error.name !== 'AbortError') {
                        console.error('Error fetching event instances:', error);
                        setIsFetchingInstances(false);
                    }
                });
        } else if (viewMode === 'averages' && eventInstances !== null) {
            setEventInstances(null);
            setIsFetchingInstances(false);
        }
    
        return () => controller.abort();
    }, [viewMode, selectedEventType, organizationID, selectedSemester?.SemesterID]);

    // Initial loading state for averages
    if (!selectedSemester || !averages) {
        return (
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Loading...</Typography>
            </Paper>
        );
    }

    // Averages view
    if (viewMode === 'averages' && Array.isArray(averages) && averages.length > 0) {
        const eventTypes = averages.map(item => item.EventType || 'Unknown');
        const attendanceRates = averages.map(item => {
            const rate = parseFloat(item.averageAttendanceRate);
            return isNaN(rate) ? 0 : rate * 100;
        });
    
        if (eventTypes.length !== attendanceRates.length) {
            console.error('Mismatch between eventTypes and attendanceRates:', { eventTypes, attendanceRates });
            return (
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography>Error: Data mismatch in averages chart</Typography>
                </Paper>
            );
        }
    
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
                    barLabel={(item) => (item.value ?? 0) > 30 ? `${Math.floor(item.value)}%` : null}
                    width={730}
                    height={255}
                    sx={{
                        '& .MuiBarLabel-root': { fontSize: '1.8rem', fill: '#fff' },
                    }}
                />
            </Paper>
        );
    }

    // Instances view (show previous averages view while fetching, then switch when ready)
    if (viewMode === 'instances' && !isFetchingInstances && Array.isArray(eventInstances) && eventInstances.length > 0) {
        const instanceLabels = eventInstances.map(instance => {
            const date = new Date(instance.EventDate);
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const day = date.getDate();
            return `${month}\n${day}`;
        });
        const instanceRates = eventInstances.map(instance => {
            const rate = instance.attendanceCount;
            console.log(rate);
            return rate;
            // us this if you want percentages
            // return rate != null && !isNaN(rate) ? rate * 100 : 0; 
        });
    
        if (instanceLabels.length !== instanceRates.length) {
            console.error('Mismatch between instanceLabels and instanceRates:', { instanceLabels, instanceRates });
            return (
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography>Error: Data mismatch in instances chart</Typography>
                </Paper>
            );
        }
    
        return (
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                    <Button variant='outlined' size='small' startIcon={<KeyboardBackspaceRoundedIcon />} onClick={() => setViewMode('averages')}>
                        Back to Averages
                    </Button>
                    <Typography>Attendance for {selectedEventType.EventType}s, {selectedSemester.TermName}</Typography>
                </Box>
                <BarChart
                    xAxis={[{
                        id: 'instanceCategories',
                        data: instanceLabels,
                        scaleType: 'band',
                        tickLabelStyle: { fontSize: 12, textAnchor: 'middle' }
                    }]}
                    yAxis={[{ label: 'Attendance Count' }]}
                    // yAxis={[{ id: 'percentage', min: 0, max: 100, label: 'Attendance Rate (%)' }]}
                    series={[{
                        data: instanceRates,
                        color: '#F76902',
                        valueFormatter: (value) => value != null ? value : 'N/A'
                        // valueFormatter: (value) => value != null ? `${value.toFixed(2)}%` : 'N/A'
                    }]}
                    barLabel={(item) => (item.value ?? 0) > 20 ? item.value : null}
                    // switch to this for percentages
                    // barLabel={(item) => (item.value ?? 0) > 20 ? `${Math.floor(item.value)}%` : null}
                    width={730}
                    height={255}
                    sx={{
                        '& .MuiBarLabel-root': { fontSize: '.8rem', fill: '#fff' },
                    }}
                />
            </Paper>
        );
    }

    // Fallback (shouldn't reach here with proper conditions)
    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Loading...</Typography>
        </Paper>
    );
}