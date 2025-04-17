import * as React from 'react';
import { Paper, Typography, Button, Box, } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import NestedDrawers from './NestedDrawers';

/**
 * AverageEventAttendanceChart.jsx
 * 
 * This React component provides a visual representation of average event attendance rates and individual event attendance counts.
 * It fetches attendance data from the backend and displays it in a bar chart using the Recharts library.
 * The component allows users to switch between viewing average attendance rates by event type and attendance counts for individual events.
 * 
 * Key Features:
 * - Fetches and displays average attendance rates for different event types.
 * - Allows users to drill down into individual event attendance counts.
 * - Provides interactive charts with tooltips and clickable bars for navigation.
 * - Handles loading states and displays appropriate messages when no data is available.
 * - Supports mobile responsiveness for better usability on smaller screens.
 * 
 * Props:
 * - organizationID: String representing the organization ID.
 * - selectedSemester: Object representing the currently selected semester (includes SemesterID and TermName).
 * 
 * Dependencies:
 * - React, Material-UI components, and Recharts library.
 * - NestedDrawers: A custom component for displaying event attendee details.
 * 
 * Functions:
 * - React.useEffect: Fetches average attendance data, event instance data, and attendee data based on user interactions.
 * - refreshData: Refetches data to update charts and attendee lists.
 * - renderAverageLabel: Custom label renderer for average attendance bars.
 * - renderInstanceLabel: Custom label renderer for individual event attendance bars.
 * - renderInstanceTooltip: Custom tooltip renderer for individual event attendance bars.
 * 
 * Hooks:
 * - React.useState: Manages state for attendance data, view modes, selected events, attendees, and UI interactions.
 * - React.useEffect: Triggers data fetching and updates based on dependencies.
 * - React.useCallback: Provides a memoized function for refreshing data.
 * 
 * @component
 */
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
    const [isMobile, setIsMobile] = React.useState(false);

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

    const minBarHeight = 15;

    const AverageBarShape = (props) => {
        const eventTypeColors = {
            "General Meeting": "#4394E5",
            "Volunteer Event": "#87BB62",
            "Workshop": "#F5921B",
            "Mentor Event": "#876FD4"
        };
        // Choose the color based on the event type; use default if undefined
        const fillColor = eventTypeColors[props.payload?.original?.EventType] || "#F76902";
        const { x, y, width, height } = props;
        // Ensure bar height is at least the minimum value
        const adjustedHeight = Math.max(height, minBarHeight);
        // Adjust y so the bottom remains the same
        const adjustedY = height < minBarHeight ? y - (minBarHeight - height) : y;
        return (
            <rect
                x={x}
                y={adjustedY}
                width={width}
                height={adjustedHeight}
                fill={fillColor}
                pointerEvents="none"
            />
        );
    };

    const InstanceBarShape = (props) => {
        const eventTypeColors = {
            "General Meeting": "#4394E5",
            "Volunteer Event": "#87BB62",
            "Workshop": "#F5921B",
            "Mentor Event": "#876FD4"
        };
        // Use the instance's event type if available (or fallback to the selectedEventType)
        const eventType = props.payload?.EventType || selectedEventType?.EventType;
        const fillColor = eventTypeColors[eventType] || "#F76902";
        const { x, y, width, height } = props;
        // Ensure bar height is at least the minimum value
        const adjustedHeight = Math.max(height, minBarHeight);
        const adjustedY = height < minBarHeight ? y - (minBarHeight - height) : y;
        return (
            <rect
                x={x}
                y={adjustedY}
                width={width}
                height={adjustedHeight}
                fill={fillColor}
                pointerEvents="none"
            />
        );
    };

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

    // mobile detection
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 740);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                                            {/* Only render Tooltip on non-mobile */}
                                            {!isMobile && (
                                                <Tooltip
                                                    formatter={(value) => `${value.toFixed(3)}%`}
                                                    contentStyle={{ color: '#000' }}
                                                    labelStyle={{ color: '#000' }}
                                                />
                                            )}
                                            <Bar
                                                dataKey="attendanceRate"
                                                shape={<AverageBarShape />}
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
                                            {/* Only render Tooltip on non-mobile */}
                                            {!isMobile && (
                                                <Tooltip
                                                    content={renderInstanceTooltip}
                                                    contentStyle={{ color: '#000' }}
                                                    labelStyle={{ color: '#000' }}
                                                />
                                            )}
                                            <Bar
                                                dataKey="attendanceCount"
                                                fill="#F76902"
                                                label={renderInstanceLabel(maxAttendance)}
                                                shape={<InstanceBarShape />}
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
            <NestedDrawers
                open={drawerOpen}
                detailsOpen={memberDrawerOpen}
                membersList={attendees}
                selectedMemberID={selectedMemberID}
                organizationID={organizationID}
                selectedSemester={selectedSemester}
                title="Event Attendees"
                searchTerm={attendeeSearch}
                onSearchChange={setAttendeeSearch}
                onClose={() => {
                    setDrawerOpen(false);
                    setMemberDrawerOpen(false);
                }}
                onDetailsClose={() => setMemberDrawerOpen(false)}
                onItemSelect={(id) => {
                    setSelectedMemberID(id);
                    setMemberDrawerOpen(true);
                }}
                onAttendanceUpdate={refreshData}
                eventDetails={selectedEventInstance}
            />
        </>
    );
}