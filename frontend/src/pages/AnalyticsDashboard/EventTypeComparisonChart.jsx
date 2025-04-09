import * as React from 'react';
import {
    Typography, Paper, Button,
    Box, Select, MenuItem,
    FormControl, InputLabel,
    CircularProgress, ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import {
    ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend
} from 'recharts';

export default function EventTypeComparisonChart({ organizationID, firstSemester, secondSemester }) {
    const [selectedEventType, setSelectedEventType] = React.useState('');
    const [comparisonData, setComparisonData] = React.useState(null);
    const [commonEventTypes, setCommonEventTypes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [chartLoading, setChartLoading] = React.useState(false);
    const [isAreaChart, setIsAreaChart] = React.useState(true);

    // Fetch common event types when the component mounts or dependencies change
    React.useEffect(() => {
        setIsLoading(true);
        fetch(`/api/analytics/commonEventTypes?organizationID=${organizationID}&firstSemesterID=${firstSemester.SemesterID}&secondSemesterID=${secondSemester.SemesterID}`)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 404) {
                    return { commonEventTypes: [] }; // Handle 404 gracefully
                } else {
                    throw new Error('Error fetching common event types');
                }
            })
            .then((data) => {
                const eventTypes = data.commonEventTypes || [];
                setCommonEventTypes(eventTypes);
                setIsLoading(false);
                // Find 'General Meeting' event type and set it as default
                const generalMeeting = eventTypes.find(eventType => eventType.EventType === 'General Meeting');
                if (generalMeeting) {
                    setSelectedEventType(generalMeeting.secondSemesterEventTypeID);
                } else if (eventTypes.length > 0) {
                    setSelectedEventType(eventTypes[0].secondSemesterEventTypeID);
                } else {
                    setSelectedEventType(''); // Reset when no event types
                }
            })
            .catch((error) => {
                console.error('Error fetching common event types:', error);
                setCommonEventTypes([]);
                setSelectedEventType('');
                setIsLoading(false);
            });
    }, [organizationID, firstSemester.SemesterID, secondSemester.SemesterID]);

    // Clear comparison data when no common event types exist
    React.useEffect(() => {
        if (commonEventTypes.length === 0) {
            setComparisonData(null);
        }
    }, [commonEventTypes]);

    // Fetch comparison data when selectedEventType changes
    React.useEffect(() => {
        if (selectedEventType) {
            setChartLoading(true);
            fetch(`/api/analytics/eventTypeComparison?organizationID=${organizationID}&firstSemesterID=${firstSemester.SemesterID}&secondSemesterID=${secondSemester.SemesterID}&eventTypeID=${selectedEventType}`)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else if (response.status === 404) {
                        return null; // Handle 404 gracefully
                    } else {
                        throw new Error('Error fetching comparison data');
                    }
                })
                .then((data) => {
                    setComparisonData(data);
                    setChartLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching comparison data:', error);
                    setComparisonData(null);
                    setChartLoading(false);
                });
        }
    }, [selectedEventType, organizationID, firstSemester.SemesterID, secondSemester.SemesterID]);

    const handleEventTypeChange = (event) => {
        setSelectedEventType(event.target.value);
    };

    // Compute chart data using useMemo to optimize performance
    const chartData = React.useMemo(() => {
        if (!comparisonData || !comparisonData.comparisonData) {
            return [];
        }
        return comparisonData.comparisonData.map(d => ({
            event: `Event ${d.eventNumber}`,
            firstSemester: d.firstSemester?.attendanceCount || 0,
            secondSemester: d.secondSemester?.attendanceCount || 0,
        }));
    }, [comparisonData]);

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                <Typography sx={{ flex: 2 }}>
                    {comparisonData?.eventTypeLabel ? `${comparisonData.eventTypeLabel} Attendance Comparison` : 'Event Type Comparison'}
                </Typography>
                <FormControl sx={{ minWidth: { xs: 100, md: 200 }, flex: 1 }} fullWidth>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                        value={selectedEventType}
                        onChange={handleEventTypeChange}
                        label="Event Type"
                        disabled={isLoading || commonEventTypes.length === 0}
                        size='small'
                    >
                        {commonEventTypes.length === 0 ? (
                            <MenuItem value="" disabled>
                                No common event types available
                            </MenuItem>
                        ) : (
                            commonEventTypes.map((eventType) => (
                                <MenuItem
                                    key={eventType.secondSemesterEventTypeID}
                                    value={eventType.secondSemesterEventTypeID}
                                >
                                    {eventType.EventType}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
            </Box>
            {/* Toggle between Area and Bar chart */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ToggleButtonGroup
                    value={isAreaChart ? 'area' : 'bar'}
                    exclusive
                    onChange={(event, newChart) => {
                        if (newChart !== null) {
                            setIsAreaChart(newChart === 'area');
                        }
                    }}
                    size="small"
                >
                    <ToggleButton value="area">Area Chart</ToggleButton>
                    <ToggleButton value="bar">Bar Chart</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : commonEventTypes.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No common event types available for comparison between the selected semesters
                    </Typography>
                </Box>
            ) : chartLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : chartData.length > 0 ? (
                isAreaChart ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="event" tick={{ fontSize: 10, textAnchor: 'middle' }} />
                            <YAxis label={{ value: 'Attendance Count', angle: -90, position: 'insideLeft', offset: 10, dy: 60 }} />
                            <Tooltip />
                            <Legend />
                            <Area
                                type="step"
                                dataKey="firstSemester"
                                stroke="#21BDE5"
                                strokeWidth={2}
                                fill="#B0DFEB"
                                fillOpacity={0.9}
                                name={firstSemester.TermName}
                            />
                            <Area
                                type="step"
                                dataKey="secondSemester"
                                stroke="#2D3846"
                                strokeWidth={2}
                                fill="#B4B7BB"
                                fillOpacity={0.5}
                                name={secondSemester.TermName}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="event" tick={{ fontSize: 10, textAnchor: 'middle' }} />
                            <YAxis label={{ value: 'Attendance Count', angle: -90, position: 'insideLeft', offset: 10, dy: 60 }} />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="firstSemester"
                                fill="#21BDE5"
                                name={firstSemester.TermName}
                            />
                            <Bar
                                dataKey="secondSemester"
                                fill="#2D3846"
                                name={secondSemester.TermName}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No event data available for comparison
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}