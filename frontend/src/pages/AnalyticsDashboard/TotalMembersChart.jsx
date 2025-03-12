import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography, Paper } from '@mui/material';

export default function TotalMembersChart({ organizationID, selectedSemester }) {
    const [memberTallies, setMemberTallies] = React.useState(null);

    React.useEffect(() => {
        if (selectedSemester) {
            fetch(`/api/analytics/memberTallies?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setMemberTallies(data);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [selectedSemester]);

    // console.log(memberTallies);

    if (!memberTallies) {
        return <div>Loading...</div>;
    }

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Total Members</Typography>
            <Typography variant='h2'>{memberTallies.totalMembers}</Typography>
            <BarChart
                
                xAxis={[
                    {
                        id: 'barCategories',
                        data: ['Active', 'Inactive'],
                        scaleType: 'band',
                        // label: 'Status'
                    },
                ]}
                yAxis={[
                    {
                        // label: 'Count',
                    }
                ]}
                series={[
                    {
                        data: [memberTallies.activeMembers, memberTallies.inactiveMembers]
                        // data: [2, 3]
                    },
                ]}
                width={240}
                height={200}
            />
        </Paper>



    );
}