import * as React from 'react';
import {
    Typography, Paper, Button,
    Box, Select, MenuItem,
    FormControl, InputLabel,
    CircularProgress
} from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AttendanceComparisonChart({ organizationID, firstSemester, secondSemester }) {
    const [comparisonData, setComparisonData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [chartLoading, setChartLoading] = React.useState(false);

    // Fetch attendance data when the component mounts or when the selected semester changes
    React.useEffect(() => {
        console.log('Fetching attendance data...');
        if (organizationID && firstSemester && secondSemester) {
            setChartLoading(true);
            // Adjust the API URL as needed for your environment.
            fetch(`/api/analytics/attendanceCountByMember?organizationID=${organizationID}&firstSemesterID=${firstSemester.SemesterID}&secondSemesterID=${secondSemester.SemesterID}`)
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
    }, [organizationID, firstSemester, secondSemester]);

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

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <Typography variant="h6">Attendance Count Comparison</Typography>
            {isLoading || chartLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : chartData.length > 0 ? (
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
                        <Legend />
                        <Area
                            type="step"
                            dataKey="firstSemester"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.3}
                            name="First Semester"
                        />
                        <Area
                            type="step"
                            dataKey="secondSemester"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            fillOpacity={0.3}
                            name="Second Semester"
                        />
                    </AreaChart>
                </ResponsiveContainer>
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