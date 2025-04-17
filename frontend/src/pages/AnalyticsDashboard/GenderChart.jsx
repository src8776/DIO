import * as React from 'react';
import { useTheme, Paper, Typography, Box, Container, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * GenderChart.jsx
 * 
 * This React component renders pie charts to display gender and race distributions for a selected semester.
 * It fetches demographic data from the backend and visualizes it using the Recharts library.
 * The component handles loading states and provides fallback messages when no data is available.
 * 
 * Key Features:
 * - Fetches gender and race demographic data for the selected semester.
 * - Displays gender and race distributions as separate pie charts.
 * - Handles loading states with a spinner while data is being fetched.
 * - Provides fallback messages when no demographic data is available.
 * - Normalizes and capitalizes gender and race data for consistent display.
 * 
 * Props:
 * - organizationID: String representing the organization ID.
 * - selectedSemester: Object representing the currently selected semester (includes SemesterID and TermName).
 * 
 * Dependencies:
 * - React, Material-UI components, and Recharts library.
 * 
 * Functions:
 * - React.useEffect: Fetches demographic data when the selected semester or organization ID changes.
 * - capitalize: Helper function to capitalize strings for consistent formatting.
 * - renderCustomizedLabel: Custom label renderer for displaying percentages on pie chart slices.
 * 
 * Hooks:
 * - React.useState: Manages state for demographic data and loading state.
 * - React.useEffect: Triggers data fetching when dependencies change.
 * 
 * @component
 */
export default function GenderChart({ organizationID, selectedSemester }) {
    const theme = useTheme();
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

    // Helper function: Capitalize a string (first letter uppercase, rest lowercase)
    const capitalize = (str) => {
        if (!str) return 'Unknown';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Normalize the genders data: if value is null, use "Unknown"; otherwise, capitalize.
    const normalizedGenders =
        demographicsData && demographicsData.genders
            ? demographicsData.genders.map((item) => ({
                ...item,
                Gender: item.Gender ? capitalize(item.Gender) : 'Unknown',
            }))
            : [];

    // Normalize the races data similarly.
    const normalizedRaces =
        demographicsData && demographicsData.races
            ? demographicsData.races.map((item) => ({
                ...item,
                Race: item.Race ? capitalize(item.Race) : 'Unknown',
            }))
            : [];

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
                        {normalizedGenders.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={normalizedGenders}
                                        dataKey="count"
                                        nameKey="Gender"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        minAngle={10}
                                    >
                                        {normalizedGenders.map((entry, index) => (
                                            <Cell key={`gender-cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
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
                            <Typography>No gender data available</Typography>
                        )}
                    </Paper>
                    <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, flex: 1 }}>
                        <Typography variant="subtitle1">Race Distribution</Typography>
                        {normalizedRaces.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={normalizedRaces}
                                        dataKey="count"
                                        nameKey="Race"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        minAngle={10}
                                    >
                                        {normalizedRaces.map((entry, index) => (
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