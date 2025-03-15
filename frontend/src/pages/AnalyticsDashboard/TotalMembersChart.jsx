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

    if (!memberTallies) {
        return <div>Loading...</div>;
    }


    // converting to numbers
    const activeMembers = Number(memberTallies.activeMembers);
    const inactiveMembers = Number(memberTallies.inactiveMembers);
    const totalMembers = Number(memberTallies.totalMembers);

    const activePercentage = Math.floor((activeMembers / totalMembers) * 100);
    const inactivePercentage = Math.floor((inactiveMembers / totalMembers) * 100);
    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Total Members</Typography>
            <Typography variant='h2'>{totalMembers}</Typography>
            <BarChart
                xAxis={[
                    {
                        id: 'barCategories',
                        data: ['Active', 'Inactive'],
                        scaleType: 'band',
                        colorMap: {
                            type: 'ordinal',
                            colors: ['#21BDE5', '#7D55C7'],
                        }
                    },
                ]}
                yAxis={[
                    {
                        // label: 'Count',
                    },
                ]}
                series={[
                    {
                        data: [activeMembers, inactiveMembers],
                        valueFormatter: (value) => `${value} members`,                  
                        // valueFormatter: (value) => `${Math.floor((value / totalMembers) * 100)}%`,                  
                    },
                ]}
                barLabel={(item, context) => {
                    if ((item.value ?? 0) > 20) {
                        return item.value;
                        // return ((Math.floor((item.value / totalMembers) * 100)) + '%').toString();
                    }
                    return null;
                }}
                width={240}
                height={200}
                sx={{
                    '& .MuiBarLabel-root': {
                        fill: '#fff', 
                    },
                }}
            />
        </Paper>
    );
}