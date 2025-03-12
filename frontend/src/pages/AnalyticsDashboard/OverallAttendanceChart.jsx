import * as React from 'react';
import { Typography, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function TotalMembersChart({ organizationID, selectedSemester }) {
    const [overallAttendance, setOverallAttendance] = React.useState(null);

    React.useEffect(() => {
        if (selectedSemester) {
            fetch(`/api/analytics/overallAttendance?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setOverallAttendance(data);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [selectedSemester]);

    if (!overallAttendance) {
        return <div>Loading...</div>;
    }

    const attendanceRate = Math.floor(overallAttendance.overallAttendanceRate * 100);

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Overall Attendance Rate</Typography>
            <Typography variant='h2' sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                {attendanceRate}%
                {attendanceRate < 50 ? <TrendingDownIcon color="error" fontSize="large" /> : <TrendingUpIcon color="success" fontSize="large" />}
            </Typography>
        </Paper>



    );
}