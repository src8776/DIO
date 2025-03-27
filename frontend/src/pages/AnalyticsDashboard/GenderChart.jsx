import * as React from 'react';
import { Paper, Typography, Box, Container, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function GenderChart({ organizationID, selectedSemester }) {
    const [demographicsData, setDemographicsData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (selectedSemester) {
            fetch(`/api/analytics/genderRaceTallies?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setDemographicsData(data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    setIsLoading(false);
                });
        }
    }, [selectedSemester, organizationID]);

    // Colors for the pie chart segments
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c'];

    // Custom label to display percentages if the slice is large enough
    const renderCustomizedLabel = ({
        cx, cy, midAngle, innerRadius, outerRadius, percent, index,
    }) => {
        // Only display label if the percentage is greater than 10%
        if (percent < 0.1) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {(percent * 100).toFixed(0)}%
            </text>
        );
    };

    return (
        <Container disableGutters sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, flex: 1 }}>
                        <Typography variant="subtitle1">Gender Distribution</Typography>
                        {demographicsData && demographicsData.genders && demographicsData.genders.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={demographicsData.genders}
                                        dataKey="count"
                                        nameKey="Gender"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                    >
                                        {demographicsData.genders.map((entry, index) => (
                                            <Cell key={`gender-cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
                                        ))}
                                    </Pie>
                                    <Legend layout='vertical' align='right' verticalAlign='middle' />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Typography>No gender data available</Typography>
                        )}
                    </Paper>
                    <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, flex: 1 }}>
                        <Typography variant="subtitle1">Race Distribution</Typography>
                        {demographicsData && demographicsData.races && demographicsData.races.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={demographicsData.races}
                                        dataKey="count"
                                        nameKey="Race"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                    >
                                        {demographicsData.races.map((entry, index) => (
                                            <Cell key={`race-cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
                                        ))}
                                    </Pie>
                                    <Legend layout='vertical' align='right' verticalAlign='middle' />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Typography>No race data available</Typography>
                        )}
                    </Paper>
                </>
            )}
        </Container>
    );
}