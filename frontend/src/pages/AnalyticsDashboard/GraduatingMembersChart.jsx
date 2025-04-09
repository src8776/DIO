import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';

export default function GraduatingMembersChart({ organizationID, semesterID }) {
    const [gradCount, setGradCount] = useState(0);
    const [memberTallies, setMemberTallies] = React.useState(null);
    const [gradMembers, setGradMembers] = useState([]);

    React.useEffect(() => {
        if (semesterID) {
            fetch(`/api/analytics/memberTallies?organizationID=${organizationID}&semesterID=${semesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setMemberTallies(data);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [semesterID, organizationID]);

    useEffect(() => {
        if (!organizationID || !semesterID) return;

        fetch(`/api/analytics/membersByGraduation?organizationID=${organizationID}&semesterID=${semesterID}`)
            .then(response => response.json())
            .then(data => {
                setGradMembers(data);
                // Set the count using the length of the returned array
                setGradCount(data.length);
            })
            .catch(error => {
                console.error('Error fetching graduating members:', error);
            });
    }, [organizationID, semesterID]);

    // Assuming memberTallies returns an object with totalMembers, default to 0 if not available
    const totalMembers = memberTallies && memberTallies.totalMembers ? memberTallies.totalMembers : 0;
    const nonGraduating = totalMembers - gradCount;

    // Data for the donut chart: graduating vs non-graduating
    const data = [
        { name: 'Graduating', value: gradCount },
        { name: 'Non-Graduating', value: nonGraduating }
    ];

    return (
        <Paper sx={{ p: 2 }}>
            <Typography>Graduating Members:</Typography>
            {totalMembers === 0 ? <Typography variant="body1" color="text.secondary" >No data to display</Typography>
                :
                <>
                    {/* <Typography>{gradCount} out of {totalMembers}</Typography> */}
                    <Box sx={{ width: '100%', height: 150 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={50}
                                    fill="#8884d8"
                                    labelLine={false}
                                    minAngle={50}
                                >
                                    <Label value={`${gradCount} / ${totalMembers}`} position="center" />
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.name === 'Graduating' ? 'rgb(75, 153, 105)' : '#8884d8'}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </>
            }
        </Paper>
    );
};