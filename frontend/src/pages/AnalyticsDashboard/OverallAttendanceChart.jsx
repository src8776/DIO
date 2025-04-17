import * as React from 'react';
import { Typography, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * OverallAttendanceChart.jsx
 * 
 * This React component displays the overall attendance rate for a selected semester.
 * It fetches attendance data from the backend and calculates the attendance rate, 
 * providing a visual indicator of whether the rate is trending up or down.
 * 
 * Key Features:
 * - Fetches overall attendance data for the selected semester.
 * - Displays the attendance rate as a percentage.
 * - Provides visual feedback with an icon indicating whether the attendance rate is high or low.
 * - Handles loading states and displays a fallback message while data is being fetched.
 * 
 * Props:
 * - organizationID: String representing the organization ID.
 * - selectedSemester: Object representing the currently selected semester (includes SemesterID and TermName).
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * 
 * Functions:
 * - React.useEffect: Fetches overall attendance data when the selected semester changes.
 * 
 * Hooks:
 * - React.useState: Manages state for the overall attendance data.
 * - React.useEffect: Triggers data fetching when dependencies change.
 * 
 * @component
 */
export default function OverallAttendanceChart({ organizationID, selectedSemester }) {
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
            <Typography variant='h3' sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                {attendanceRate}%
                {attendanceRate < 50 ? <TrendingDownIcon color="error" fontSize="large" /> : <TrendingUpIcon color="success" fontSize="large" />}
            </Typography>
        </Paper>



    );
}