import * as React from 'react';
import {
    Typography, Paper, Button,
    Box, Select, MenuItem,
    FormControl, InputLabel,
    CircularProgress, ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import {
    ResponsiveContainer, AreaChart,
    Area, BarChart, Bar, XAxis,
    YAxis, CartesianGrid, Tooltip,
    Legend
} from 'recharts';

export default function AttendanceComparisonChart({ organizationID, firstSemester, secondSemester }) {
    const [comparisonData, setComparisonData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [chartLoading, setChartLoading] = React.useState(false);
    const [isAreaChart, setIsAreaChart] = React.useState(true);
    const [commonEventTypes, setCommonEventTypes] = React.useState([]);
    // selectedFilter will be "overall" for overall attendance, or the eventTypeID for a specific event type
    const [selectedFilter, setSelectedFilter] = React.useState('overall');

    // Fetch common event types for the selected semesters
    React.useEffect(() => {
        if (organizationID && firstSemester && secondSemester) {
            fetch(`/api/analytics/commonEventTypes?organizationID=${organizationID}&firstSemesterID=${firstSemester.SemesterID}&secondSemesterID=${secondSemester.SemesterID}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error fetching common event types');
                    }
                    return response.json();
                })
                .then(data => {
                    setCommonEventTypes(data.commonEventTypes || []);
                })
                .catch(error => {
                    console.error('Error fetching common event types:', error);
                    setCommonEventTypes([]);
                });
        }
    }, [organizationID, firstSemester, secondSemester]);

    // Fetch attendance data when the component mounts or when the semesters or selected filter changes
    React.useEffect(() => {
        if (organizationID && firstSemester && secondSemester) {
            setChartLoading(true);
            let url = '';
            if (selectedFilter === 'overall') {
                url = `/api/analytics/attendanceCountByMember?organizationID=${organizationID}&firstSemesterID=${firstSemester.SemesterID}&secondSemesterID=${secondSemester.SemesterID}`;
            } else {
                url = `/api/analytics/attendanceCountByMemberByEventType?organizationID=${organizationID}&firstSemesterID=${firstSemester.SemesterID}&secondSemesterID=${secondSemester.SemesterID}&eventTypeID=${selectedFilter}`;
            }
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setComparisonData(data);
                    setChartLoading(false);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching attendance data:', error);
                    setChartLoading(false);
                    setIsLoading(false);
                });
        }
    }, [organizationID, firstSemester, secondSemester, selectedFilter]);

    // Compute histogram data for the chart
    const chartData = React.useMemo(() => {
        if (!comparisonData) return [];
        const firstData = comparisonData.firstSemester || [];
        const secondData = comparisonData.secondSemester || [];

        const firstHistogram = {};
        firstData.forEach(item => {
            const count = item.attendanceCount;
            firstHistogram[count] = (firstHistogram[count] || 0) + 1;
        });

        const secondHistogram = {};
        secondData.forEach(item => {
            const count = item.attendanceCount;
            secondHistogram[count] = (secondHistogram[count] || 0) + 1;
        });

        // Determine the maximum attendance count from both histograms 
        const allAttendanceCounts = new Set([
            ...Object.keys(firstHistogram),
            ...Object.keys(secondHistogram)
        ].map(Number));
        const maxAttendance = Math.max(...allAttendanceCounts, 1);

        // Build histogram data for each attendance count starting from 1
        const data = [];
        for (let i = 1; i <= maxAttendance; i++) {
            data.push({
                attendanceCount: i,
                firstSemester: firstHistogram[i] || 0,
                secondSemester: secondHistogram[i] || 0
            });
        }
        return data;
    }, [comparisonData]);

    console.log('Chart Data:', chartData);

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                <Typography sx={{ flex: 2 }}>Commitment Comparison</Typography>

                <FormControl sx={{ minWidth: { xs: 100, md: 200 }, flex: 1 }} fullWidth>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                        value={selectedFilter}
                        label="Event Type"
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        disabled={isLoading || commonEventTypes.length === 0}
                        size='small'
                    >
                        <MenuItem value="overall">Overall Attendance</MenuItem>
                        {commonEventTypes.map((evt) => (
                            <MenuItem key={evt.secondSemesterEventTypeID} value={evt.secondSemesterEventTypeID}>
                                {evt.EventType}
                            </MenuItem>
                        ))}
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



            {isLoading || chartLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : chartData.length > 0 ? (
                isAreaChart ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                label={{ value: 'Attendance Count', position: 'insideBottom', offset: -5 }}
                                dataKey="attendanceCount"
                                tick={{ fontSize: 10, textAnchor: 'middle' }}
                            />
                            <YAxis
                                label={{
                                    value: 'Member Count',
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: 10,
                                    dy: 60
                                }}
                            />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
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
                            <XAxis
                                label={{ value: 'Attendance Count', position: 'insideBottom', offset: -5 }}
                                dataKey="attendanceCount"
                                tick={{ fontSize: 10, textAnchor: 'middle' }}
                            />
                            <YAxis
                                label={{
                                    value: 'Member Count',
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: 10,
                                    dy: 60
                                }}
                            />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
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
                        No attendance data available for comparison.
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}