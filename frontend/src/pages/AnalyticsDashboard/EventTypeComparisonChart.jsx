import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import {
    Typography, Paper, Button,
    Box, Select, MenuItem,
    FormControl, InputLabel,
    CircularProgress
} from '@mui/material';

export default function EventTypeComparisonChart({ organizationID, firstSemester, secondSemester }) {
    const [selectedEventType, setSelectedEventType] = React.useState('');
    const [comparisonData, setComparisonData] = React.useState(null);
    const [commonEventTypes, setCommonEventTypes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [chartLoading, setChartLoading] = React.useState(false);

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
                if (eventTypes.length > 0) {
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

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                <Typography>
                    {comparisonData?.eventTypeLabel ? `${comparisonData.eventTypeLabel} Attendance Comparison` : 'Event Type Comparison'}
                </Typography>
                <FormControl sx={{ minWidth: 200 }}>
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
            ) : comparisonData && comparisonData.comparisonData && comparisonData.comparisonData.length > 0 ? (
                <BarChart
                    series={[
                        {
                            label: comparisonData.semesterLabels[firstSemester.SemesterID],
                            data: comparisonData.comparisonData.map(d => d.firstSemester?.attendanceCount || 0),
                        },
                        {
                            label: comparisonData.semesterLabels[secondSemester.SemesterID],
                            data: comparisonData.comparisonData.map(d => d.secondSemester?.attendanceCount || 0),
                        },
                    ]}
                    xAxis={[{ scaleType: 'band', data: comparisonData.comparisonData.map(d => `Event ${d.eventNumber}`) }]}
                    height={300}
                    yAxis={[{ label: 'Attendance Count' }]}
                    layout="vertical"
                />
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
