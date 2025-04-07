import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Text } from 'recharts';

export default function GraduatingMembersChart({ organizationID, semesterID }) {
    const [gradCount, setGradCount] = useState(0);

    useEffect(() => {
        if (!organizationID || !semesterID) return;

        fetch(`/api/analytics/membersByGraduation?organizationID=${organizationID}&semesterID=${semesterID}`)
            .then(response => response.json())
            .then(data => {
                // Set the count using the length of the returned array
                setGradCount(data.length);
            })
            .catch(error => {
                console.error('Error fetching graduating members:', error);
            });
    }, [organizationID, semesterID]);

    // Data to display in the chart
    const data = [
        { name: 'Graduating', count: gradCount }
    ];

    const renderBarLabel = (props) => {
        const { x, y, width, height, value } = props;
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
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography>Graduating Members: {gradCount}</Typography>
            <Box sx={{ width: '100%', height: 183 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        {/* <YAxis allowDecimals={false} /> */}
                        <Tooltip />
                        <Bar dataKey="count" fill="#b5ddce" label={renderBarLabel} />
                    </BarChart>
                </ResponsiveContainer>

            </Box>
        </Paper>
    );
};