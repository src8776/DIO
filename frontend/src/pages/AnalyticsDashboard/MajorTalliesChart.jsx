import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography, Paper, Box, CircularProgress } from '@mui/material';

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

    const majors = majorTallies ? majorTallies.map((item) => item.major) : [];
    const memberCounts = majorTallies ? majorTallies.map((item) => item.memberCount) : [];

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Members per Major</Typography>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                </Box>
            ) : majorTallies.length > 0 ? (
                <BarChart
                    xAxis={[
                        {
                            scaleType: 'linear',
                            label: 'Member Count',
                        },
                    ]}
                    yAxis={[
                        {
                            scaleType: 'band',
                            data: majors,
                            disableTicks: true,
                            disableLine: true,
                        },
                    ]}
                    series={[
                        {
                            data: memberCounts,
                            color: '#F76902',
                        },
                    ]}
                    width={500}
                    height={155}
                    layout="horizontal"
                    // Optional: Customize label appearance
                    sx={{
                        '& .MuiChartsAxis-label': {
                            transform: 'translateY(5px)',
                        },
                        '& .MuiBarElement-root': {
                            rx: 4, // Rounded corners on bars
                        },
                        '& .MuiChartsAxis-valueLabel': {
                            fontSize: 12, // Label font size
                            fill: '#000', // Label color
                        },
                    }}
                />
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