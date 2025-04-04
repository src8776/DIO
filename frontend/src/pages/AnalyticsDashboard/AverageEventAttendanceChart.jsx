import * as React from 'react';
import {
    Paper, Typography, Button, Box, Drawer,
    List, ListItem, ListItemText, TextField,
    IconButton
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import MemberDetailsPage from '../MemberDetails/MemberDetailsPage';
import CloseIcon from '@mui/icons-material/Close';

export default function AverageEventAttendanceChart({ organizationID, selectedSemester }) {
    const [averages, setAverages] = React.useState(null);
    const [viewMode, setViewMode] = React.useState('averages');
    const [selectedEventType, setSelectedEventType] = React.useState(null);
    const [eventInstances, setEventInstances] = React.useState(null);
    const [isFetchingInstances, setIsFetchingInstances] = React.useState(false);
    const [selectedEventInstance, setSelectedEventInstance] = React.useState(null);
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [attendees, setAttendees] = React.useState([]);
    const [attendeeSearch, setAttendeeSearch] = React.useState("");
    const [selectedMemberID, setSelectedMemberID] = React.useState(null);
    const [memberDrawerOpen, setMemberDrawerOpen] = React.useState(false);

    // Fetch average attendance data
    React.useEffect(() => {
        setViewMode('averages');
        if (selectedSemester && selectedSemester.SemesterID) {
            fetch(`/api/analytics/averageAttendance?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => setAverages(data))
                .catch((error) => console.error('Error fetching averages:', error));
        } else {
            setAverages(null);
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

    // Fetch attendees for the selected event instance
    React.useEffect(() => {
        if (selectedEventInstance) {
            fetch(`/api/analytics/attendeesOfEvent?eventID=${selectedEventInstance.EventID}`)
                .then((response) => response.json())
                .then((data) => setAttendees(data))
                .catch((error) => {
                    console.error('Error fetching attendees:', error);
                    setAttendees([]);
                });
        } else {
            setAttendees([]);
        }
    }, [selectedEventInstance]);

    // Define refreshData callback to update charts and attendees
    const refreshData = React.useCallback(() => {
        // Refetch averages
        fetch(`/api/analytics/averageAttendance?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
            .then((response) => response.json())
            .then((data) => setAverages(data))
            .catch((error) => console.error('Error fetching averages:', error));

        // Refetch event instances if in 'instances' view
        if (viewMode === 'instances' && selectedEventType) {
            setIsFetchingInstances(true);
            fetch(`/api/analytics/eventInstanceAttendance?eventTypeID=${selectedEventType.EventTypeID}&semesterID=${selectedSemester.SemesterID}&organizationID=${organizationID}`)
                .then((response) => response.json())
                .then((data) => {
                    setEventInstances(data);
                    setIsFetchingInstances(false);
                })
                .catch((error) => {
                    console.error('Error fetching event instances:', error);
                    setIsFetchingInstances(false);
                });
        }

        // Refetch attendees if an event instance is selected
        if (selectedEventInstance) {
            fetch(`/api/analytics/attendeesOfEvent?eventID=${selectedEventInstance.EventID}`)
                .then((response) => response.json())
                .then((data) => setAttendees(data))
                .catch((error) => {
                    console.error('Error fetching attendees:', error);
                    setAttendees([]);
                });
        }
    }, [organizationID, selectedSemester?.SemesterID, viewMode, selectedEventType, selectedEventInstance]);

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
                    pointerEvents="none"
                >
                    {Math.floor(value)}%
                </text>
            );
        }
        return null;
    };

    const CustomBackground = (props) => {
        const { x, width, height, payload } = props;
        return (
            <rect
                x={x}
                y={0}
                width={width}
                height={height} // This is the full chart height, as provided by Recharts
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    setSelectedEventType(payload.original);
                    setViewMode('instances');
                }}
            />
        );
    };

    // Custom background for instances chart
    const CustomInstanceBackground = (props) => {
        const { x, width, height, payload } = props;
        return (
            <rect
                x={x}
                y={0}
                width={width}
                height={height}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    setSelectedEventInstance(payload);
                    setDrawerOpen(true);
                }}
            />
        );
    };

    const CustomBarShape = (props) => {
        const { fill, x, y, width, height } = props;
        return (
            <rect
                x={x}
                y={y}
                width={width}
                height={height} // This is the bar’s height, based on the data value
                fill={fill}
                pointerEvents="none"
            />
        );
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
                    pointerEvents="none"
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
            const { EventTitle } = payload[0].payload;
            return (
                <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '5px', color: '#000' }}>
                    <p>{`Date: ${label}`}</p>
                    <p>{`Event: ${EventTitle || 'Unknown'}`}</p>
                    <p>{`${payload[0].value} attended`}</p>
                </div>
            );
        }
        return null;
    };

    // Filter attendees based on search query
    const filteredAttendees = (Array.isArray(attendees) ? attendees : []).filter(attendee => {
        const fullName = `${attendee.FirstName} ${attendee.LastName}`.toLowerCase();
        return fullName.includes(attendeeSearch.toLowerCase());
    });


    return (
        <>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(!selectedSemester || !averages) ? (
                    <Typography>Loading...</Typography>
                ) : viewMode === 'averages' && Array.isArray(averages) && averages.length > 0 ? (
                    (() => {
                        const data = averages.map(item => {
                            const rate = parseFloat(item.averageAttendanceRate);
                            return {
                                name: item.EventType || 'Unknown',
                                attendanceRate: isNaN(rate) ? 0 : rate * 100,
                                original: item
                            };
                        });
                        return (
                            <>
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
                                                shape={<CustomBarShape fill="#F76902" />}
                                                background={<CustomBackground />}
                                                label={renderAverageLabel}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </>
                        );
                    })()
                ) : viewMode === 'instances' && !isFetchingInstances && Array.isArray(eventInstances) && eventInstances.length > 0 ? (
                    (() => {
                        const data = eventInstances
                            .filter(instance => instance.attendanceCount > 0) // Filter out instances with 0 attendees
                            .map(instance => {
                                const date = new Date(instance.EventDate);
                                const month = date.toLocaleDateString('en-US', { month: 'short' });
                                const day = date.getDate();
                                return {
                                    ...instance,
                                    name: `${month} ${day}`,
                                };
                            });
                        const maxAttendance = Math.max(...data.map(item => item.attendanceCount));
                        return (
                            <>
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
                                            <XAxis dataKey="name" tick={{ fontSize: 10, textAnchor: 'middle' }} label={{ value: 'Date', position: 'insideBottom', offset: -10 }} />
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
                                                shape={<CustomBarShape fill="#F76902" />}
                                                background={<CustomInstanceBackground />}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </>
                        );
                    })()
                ) : (
                    <>
                        <Typography>Average Attendance per Event Type</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                No data to display
                            </Typography>
                        </Box>
                    </>
                )}
            </Paper>
            {/* attendees drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setMemberDrawerOpen(false); // Close both drawers when attendees drawer closes
                }}
                sx={{
                    zIndex: 1200,
                    '& .MuiDrawer-paper': {
                        width: { xs: 300, sm: 400 },
                        left: 0
                    },
                }}
            >
                <Box sx={{ width: { xs: 300, sm: 400 }, p: 2, bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #ccc' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                            onClick={() => {
                                setDrawerOpen(false);
                                setMemberDrawerOpen(false);
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {selectedEventInstance && (
                        <>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {selectedEventInstance.EventTitle}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {new Date(selectedEventInstance.EventDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Type: {selectedEventInstance.EventType}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Attendance: {selectedEventInstance.attendanceCount}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                                Attendees:
                            </Typography>
                            {/* Search Field */}
                            <TextField
                                size="small"
                                variant="outlined"
                                placeholder="Search attendees..."
                                value={attendeeSearch}
                                onChange={(e) => setAttendeeSearch(e.target.value)}
                                sx={{ mb: 1 }}
                            />
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                                {filteredAttendees.length > 0 ? (
                                    <List dense>
                                        {filteredAttendees.map((attendee) => (
                                            <ListItem
                                                key={attendee.MemberID}
                                                button
                                                onClick={() => {
                                                    setSelectedMemberID(attendee.MemberID);
                                                    setMemberDrawerOpen(true);
                                                }}
                                                divider
                                                sx={{ py: 1, cursor: 'pointer' }}
                                            >
                                                <ListItemText primary={`${attendee.FirstName} ${attendee.LastName}`} />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No attendees found
                                    </Typography>
                                )}
                            </Box>
                        </>
                    )}
                </Box>
            </Drawer>
            {/* member details drawer */}
            <Drawer
                anchor="left"
                open={memberDrawerOpen}
                onClose={() => setMemberDrawerOpen(false)}
                variant="persistent"
                sx={{
                    zIndex: 1300,
                    // Shift the member drawer right by the width of the attendees drawer
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 500, md: 700 },
                        '@media (min-width:1102px)': {
                            left: 400, // when viewport is 1102px or greater
                        }
                    }
                }}
            >
                <Box sx={{ width: { xs: '100%', sm: 500, md: 700 }, height: '100%', overflowY: 'auto' }}>
                    {selectedMemberID && (
                        <MemberDetailsPage
                            memberID={selectedMemberID}
                            orgID={organizationID}
                            selectedSemester={selectedSemester}
                            onClose={() => setMemberDrawerOpen(false)}
                            onAttendanceUpdate={refreshData} // Refresh data when attendance is updated
                        />
                    )}
                </Box>
            </Drawer>
        </>
    );
}