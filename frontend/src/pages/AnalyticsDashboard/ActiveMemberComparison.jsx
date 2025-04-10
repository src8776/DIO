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