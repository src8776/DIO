import * as React from 'react';
import {
    useTheme, Paper, Typography, Box,
    CircularProgress, Switch,
    ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
    BarChart, Bar, XAxis,
    YAxis, CartesianGrid,
    Tooltip, Legend,
    ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

/**
 * MajorTalliesChart.jsx
 * 
 * This React component provides a visual representation of the distribution of members across different majors
 * for a selected semester. It allows users to toggle between a pie chart and a bar chart view to analyze the data.
 * The component fetches data from the backend and dynamically updates the charts based on the selected semester.
 * 
 * Key Features:
 * - Fetches and displays the number of members per major for the selected semester.
 * - Allows users to toggle between pie chart and bar chart views.
 * - Handles loading states and displays appropriate messages when no data is available.
 * - Formats long major names to fit within the chart display.
 * - Provides interactive tooltips and legends for better data visualization.
 * 
 * Props:
 * - organizationID: String representing the organization ID.
 * - selectedSemester: Object representing the currently selected semester (includes SemesterID and TermName).
 * 
 * Dependencies:
 * - React, Material-UI components, and Recharts library.
 * 
 * Functions:
 * - React.useEffect: Fetches member tallies by major when the selected semester changes.
 * - formatMajorName: Formats long major names to fit within the chart display.
 * - renderCustomizedLabel: Custom label renderer for displaying percentages on pie chart slices.
 * 
 * Hooks:
 * - React.useState: Manages state for major tallies, loading state, and chart type (pie or bar).
 * - React.useEffect: Triggers data fetching when the selected semester changes.
 * 
 * @component
 */
export default function MajorTalliesChart({ organizationID, selectedSemester }) {
    const theme = useTheme();
    const [majorTallies, setMajorTallies] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showPie, setShowPie] = React.useState(true);

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
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography>Members per Major</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={showPie ? 'pie' : 'bar'}
                        exclusive
                        onChange={(event, newValue) => {
                            if (newValue !== null) {
                                setShowPie(newValue === 'pie');
                            }
                        }}
                        size="small"
                    >
                        <ToggleButton value="bar">Bar Chart</ToggleButton>
                        <ToggleButton value="pie">Pie Chart</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                </Box>
            ) : majorTallies.length > 0 ? (
                showPie ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="memberCount"
                                nameKey="major"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                labelLine={false}
                                label={renderCustomizedLabel} // Added custom label to show percentages
                                minAngle={10}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        style={{ outline: 'none' }}
                                    />
                                ))}
                            </Pie>
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                formatter={(value) => (
                                    <span style={{ color: theme.palette.memberPerMajorText.default }}>
                                        {value}
                                    </span>
                                )} />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
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
                            <Bar dataKey="memberCount" fill="#F76902" radius={[4, 4, 4, 4]} />
                        </BarChart>
                    </ResponsiveContainer>
                )
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        height: 300,
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="body1" color="text.secondary">
                        No data to display
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}