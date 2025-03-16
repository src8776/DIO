import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography, Paper, Button, Box } from '@mui/material';

export default function EventTypeComparisonChart({ organizationID, firstSemester, secondSemester }) {
    const [selectedEventType, setSelectedEventType] = React.useState(null);
    const [comparisonData, setComparisonData] = React.useState(null);

    React.useEffect(() => {
        fetch(`/api/analytics/eventTypeComparison?organizationID=${organizationID}&firstSemesterID=${firstSemester.SemesterID}&secondSemesterID=${secondSemester.SemesterID}&eventTypeID=${selectedEventType.EventTypeID}`)
            .then((response) => response.json())
            .then((data) => {
                setComparisonData(data);
            })
            .catch((error) => {
                console.error('Error fetching comparison data:', error);
                setIsLoading(false);
            });
    }, []);

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Event Type Comparison</Typography>
            <BarChart>
                
            </BarChart>
        </Paper>
    );
}
