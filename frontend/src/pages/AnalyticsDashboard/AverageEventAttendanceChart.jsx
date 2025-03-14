import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography, Paper } from '@mui/material';

export default function AverageEventAttendanceChart({ organizationID, selectedSemester }) {
    const [averages, setAverages] = React.useState(null);

    React.useEffect(() => {
        // Only fetch if selectedSemester exists and has a valid SemesterID
        if (selectedSemester && selectedSemester.SemesterID) {
            fetch(`/api/analytics/averageAttendance?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setAverages(data);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [organizationID, selectedSemester?.SemesterID]);

    if (!averages) {
        return <div>Loading...</div>;
    }

    const eventTypes = averages.map(item => item.EventType);
    const attendanceRates = averages.map(item => parseFloat(item.averageAttendanceRate) * 100);

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Average Attendance per Event Type</Typography>
            <BarChart
                xAxis={[
                    {
                        id: 'barCategories',
                        data: eventTypes,
                        scaleType: 'band',
                        label: 'Event Type',

                    },
                ]}
                yAxis={[
                    {
                        id: 'percentage',
                        min: 0,
                        max: 100,
                        label: 'Attendance Rate (%)',
                    },
                ]}
                series={[
                    {
                        data: attendanceRates,
                        color: '#F76902',
                        valueFormatter: (value) => `${value.toFixed(3)}%`,
                    },
                ]}
                barLabel={(item, context) => {
                    if ((item.value ?? 0) > 30) {
                        return (Math.floor(item.value) + '%').toString();
                    }
                    return null;
                }}
                width={730}
                height={255}
                sx={{
                    '& .MuiBarLabel-root': {
                        fontSize: '1.8rem',
                        fill: '#fff',
                    },
                }}
            />
        </Paper>
    );
}