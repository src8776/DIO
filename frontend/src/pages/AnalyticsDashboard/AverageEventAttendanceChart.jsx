import * as React from 'react';
import { Paper, Typography, Button, Box } from '@mui/material';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function AverageEventAttendanceChart({ organizationID, selectedSemester }) {
    const [averages, setAverages] = React.useState(null);
    const [viewMode, setViewMode] = React.useState('averages');
    const [selectedEventType, setSelectedEventType] = React.useState(null);
    const [eventInstances, setEventInstances] = React.useState(null);
    const [isFetchingInstances, setIsFetchingInstances] = React.useState(false);

    // Fetch average attendance data
    React.useEffect(() => {
        setViewMode('averages'); // Reset view mode when semester changes
        if (selectedSemester && selectedSemester.SemesterID) {
            // console.log('Fetching averages for semester:', selectedSemester.SemesterID);
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

    // Label renderer for Average Chart
    const renderAverageLabel = (props) => {
        const { x, y, width, height, value } = props;
        if (value > 20) {
            return (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    {Math.floor(value)}%
                </text>
            );
        }
        return null;
    };

    // TODO: If container width is < 740px, hide labels 
    // Label renderer for Instance Chart
    const renderInstanceLabel = (maxAttendance) => (props) => {
        const { x, y, width, height, value } = props;
        if (value > 0.2 * maxAttendance) {
            return (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    {value}
                </text>
            );
        }
        return null;
    };

    // Custom tooltip for Instance Chart that displays the event title as well
    const renderInstanceTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const { eventTitle } = payload[0].payload;
            return (
                <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '5px', color: '#000' }}>
                    <p>{`Date: ${label}`}</p>
                    <p>{`Event: ${eventTitle || 'Unknown'}`}</p>
                    <p>{`${payload[0].value} attended`}</p>
                </div>
            );
        }
        return null;
    };

    // Initial loading state for averages
    if (!selectedSemester || !averages) {
        return (
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Loading...</Typography>
            </Paper>
        );
    }

    // console.log('Averages:', averages);
    console.log('Event Instances:', eventInstances);

    // Averages view
    if (viewMode === 'averages' && Array.isArray(averages) && averages.length > 0) {
        const data = averages.map(item => {
            const rate = parseFloat(item.averageAttendanceRate);
            return {
                name: item.EventType || 'Unknown',
                attendanceRate: isNaN(rate) ? 0 : rate * 100,
                original: item // Preserve the original item for onClick use
            };
        });

        // Check that each data point is valid
        if (data.length === 0) {
            console.error('No valid average data to display');
            return (
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography>Error: Data mismatch in averages chart</Typography>
                </Paper>
            );
        }

        return (
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Average Attendance per Event Type</Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" label={{ value: 'Event Type', position: 'insideBottom', offset: -10 }} />
                            <YAxis domain={[0, 100]} label={{ value: 'Attendance Rate (%)', angle: -90, position: 'insideLeft', offset: 10, dy: 60 }} />
                            <Tooltip
                                formatter={(value) => `${value.toFixed(3)}%`}
                                contentStyle={{ color: '#000' }}
                                labelStyle={{ color: '#000' }}
                            />
                            <Bar
                                dataKey="attendanceRate"
                                fill="#F76902"
                                onClick={(data, index) => {
                                    // Use the original averages item to preserve additional properties
                                    setSelectedEventType(data.payload.original);
                                    setViewMode('instances');
                                }}
                                label={renderAverageLabel}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        );
    }



    // Instances view (show previous averages view while fetching, then switch when ready)
    if (viewMode === 'instances' && !isFetchingInstances && Array.isArray(eventInstances) && eventInstances.length > 0) {
        const data = eventInstances.map(instance => {
            const date = new Date(instance.EventDate);
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const day = date.getDate();
            return {
                name: `${month} ${day}`,
                attendanceCount: instance.attendanceCount,
                eventTitle: instance.EventTitle
            };
        });

        if (data.length === 0) {
            console.error('No valid instance data to display');
            return (
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography>Error: Data mismatch in instances chart</Typography>
                </Paper>
            );
        }

        const maxAttendance = Math.max(...data.map(item => item.attendanceCount));

        return (
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                    <Button variant='outlined' size='small' startIcon={<KeyboardBackspaceRoundedIcon />} onClick={() => setViewMode('averages')}>
                        Back to Averages
                    </Button>
                    <Typography>
                        Attendance for {selectedEventType.EventType}s, {selectedSemester.TermName}
                    </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, textAnchor: 'middle' }} label={{ value: 'Attendance Count', position: 'insideBottom', offset: -10 }} />
                            <YAxis label={{ value: 'Attendance Count', angle: -90, position: 'insideLeft', offset: 10, dy: 50 }} />
                            <Tooltip
                                content={renderInstanceTooltip}
                                contentStyle={{ color: '#000' }}
                                labelStyle={{ color: '#000' }}
                            />
                            <Bar
                                dataKey="attendanceCount"
                                fill="#F76902"
                                label={renderInstanceLabel(maxAttendance)}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        );
    }

    // Fallback (shouldn't reach here with proper conditions)
    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Average Attendance per Event Type</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No data to display
                </Typography>
            </Box>
        </Paper>
    );
}