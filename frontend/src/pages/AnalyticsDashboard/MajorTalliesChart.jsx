import * as React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

export default function MajorTalliesChart({ organizationID, selectedSemester }) {
    const [majorTallies, setMajorTallies] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (selectedSemester) {
            fetch(`/api/analytics/membersByMajor?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setMajorTallies(data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    setIsLoading(false);
                });
        }
    }, [selectedSemester]);

    // Format long major names to fit in the chart
    const formatMajorName = (major) => {
        return major.length > 30 ? major.match(/.{1,20}(\s|$)/g).join('\n') : major;
    };

    // Create data array for Recharts
    const chartData = majorTallies
        ? majorTallies.map((item) => ({
              major: item.major,
              memberCount: item.memberCount,
          }))
        : [];

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Members per Major</Typography>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                </Box>
            ) : majorTallies.length > 0 ? (
                <ResponsiveContainer width="100%" height={150}>
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 0, right: 0, left: 0, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            label={{ value: 'Member Count', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="major"
                            tickFormatter={formatMajorName}
                            tick={{ textAnchor: 'end', dominantBaseline: 'middle' }}
                            width={150}
                        />
                        <Tooltip />
                        {/* <Legend /> */}
                        <Bar
                            dataKey="memberCount"
                            fill="#F76902"
                            radius={[4, 4, 4, 4]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No data to display
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}