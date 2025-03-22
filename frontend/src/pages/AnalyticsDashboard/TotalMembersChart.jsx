import * as React from 'react';
import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Text } from 'recharts';

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
    }, [selectedSemester, organizationID]);

    if (!memberTallies) {
        return <div>Loading...</div>;
    }

    // converting to numbers
    const activeMembers = Number(memberTallies.activeMembers);
    const inactiveMembers = Number(memberTallies.inactiveMembers);
    const totalMembers = Number(memberTallies.totalMembers);

    const data = [
        { name: 'Active', members: activeMembers },
        { name: 'Inactive', members: inactiveMembers }
    ];

    const colors = ['#21BDE5', '#7D55C7'];

    const renderBarLabel = (props) => {
        const { x, y, width, height, value } = props;
        if (value > 20) {
            return (
                <Text
                    x={x + width / 2}
                    y={y + height / 2}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    {value}
                </Text>
            );
        }
        return null;
    };

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Total Members</Typography>
            <Typography variant='h2'>{totalMembers}</Typography>
            <BarChart
                width={240}
                height={200}
                data={data}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                {/* <YAxis /> */}
                <Tooltip formatter={(value) => `${value}`} />
                <Bar dataKey="members" label={renderBarLabel}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Bar>
            </BarChart>
        </Paper>
    );
}