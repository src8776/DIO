import * as React from 'react';
import {
    Typography, Paper, Box,
    CircularProgress
} from '@mui/material';
import {
    ResponsiveContainer, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    Legend
} from 'recharts';

/**
 * ActiveMemberComparison.jsx
 * 
 * This React component provides a visual comparison of active and general member counts across two semesters.
 * It fetches member tally data from the backend and displays it in a bar chart using the Recharts library.
 * 
 * Key Features:
 * - Fetches and maps member tally data for the selected semesters.
 * - Displays a bar chart comparing active and general member counts across semesters.
 * - Handles loading states with a circular progress indicator.
 * - Provides error handling for failed data fetches.
 * 
 * Props:
 * - organizationID: String representing the organization ID.
 * - firstSemester: Object representing the first semester to compare (includes SemesterID and TermName).
 * - secondSemester: Object representing the second semester to compare (includes SemesterID and TermName).
 * 
 * Dependencies:
 * - React, Material-UI components, and Recharts library.
 * 
 * Functions:
 * - React.useEffect: Fetches member tally data when the organization ID or semesters change.
 * - fetch: Sends a request to the backend API to retrieve member tally data.
 * - setComparisonData: Maps and sets the fetched data for rendering in the chart.
 * 
 * Hooks:
 * - React.useState: Manages state for the fetched comparison data.
 * - React.useEffect: Triggers data fetching when dependencies change.
 * 
 * @component
 */
export default function ActiveMemberComparison({ organizationID, firstSemester, secondSemester }) {
    const semesters = [firstSemester, secondSemester];
    const [comparisonData, setComparisonData] = React.useState(null);

    React.useEffect(() => {
        if (organizationID && semesters && semesters.length > 0) {
            const semesterIDs = semesters.map(sem => sem.SemesterID).join(',');
            fetch(`/api/analytics/memberTalliesBySemesters?organizationID=${organizationID}&semesterIDs=${semesterIDs}`)
                .then(response => response.json())
                .then(data => {
                    // Map the returned data to include semester term names from the semesters prop
                    const mapped = data.map(item => {
                        const semObj = semesters.find(s => s.SemesterID === item.SemesterID);
                        return {
                            semester: semObj ? semObj.TermName : `Semester ${item.SemesterID}`,
                            activeMembers: item.activeMembers,
                            generalMembers: item.generalMembers,
                            totalMembers: item.totalMembers
                        };
                    });
                    setComparisonData(mapped);
                })
                .catch(error => {
                    console.error('Error fetching member tallies:', error);
                });
        }
    }, [organizationID, firstSemester, secondSemester]);

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <Typography sx={{ flex: 2 }}>
                Compare Active and General Member counts across semesters.
            </Typography>
            <Box sx={{ p: 2 }}>
                {comparisonData ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="semester" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="activeMembers" fill="#21BDE5" name="Active Members" />
                            <Bar dataKey="generalMembers" fill="#2D3846" name="General Members" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <CircularProgress />
                )}
            </Box>
        </Paper>
    );
}