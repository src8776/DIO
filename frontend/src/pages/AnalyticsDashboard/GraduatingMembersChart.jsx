import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Box,
} from '@mui/material';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';
import NestedDrawers from './NestedDrawers';

export default function GraduatingMembersChart({ organizationID, semesterID: selectedSemester }) {
    const [gradCount, setGradCount] = useState(0);
    const [memberTallies, setMemberTallies] = React.useState(null);
    const [gradMembers, setGradMembers] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [membersList, setMembersList] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedMemberID, setSelectedMemberID] = useState(null);
    const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");

    // Fetch member tallies (total members)
    React.useEffect(() => {
        if (selectedSemester.SemesterID) {
            fetch(`/api/analytics/memberTallies?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setMemberTallies(data);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [selectedSemester.SemesterID, organizationID]);

    // Fetch graduating members
    useEffect(() => {
        if (!organizationID || !selectedSemester.SemesterID) return;
        fetch(`/api/analytics/membersByGraduation?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
            .then(response => response.json())
            .then(data => {
                setGradMembers(data);
                setGradCount(data.length);
            })
            .catch(error => console.error('Error fetching graduating members:', error));
    }, [organizationID, selectedSemester.SemesterID]);

    // Close drawers when semester changes to avoid outdated data
    useEffect(() => {
        setDrawerOpen(false);
        setMemberDrawerOpen(false);
    }, [selectedSemester.SemesterID]);

    const totalMembers = memberTallies?.totalMembers || 0;
    const nonGraduating = totalMembers - gradCount;

    // Data for the donut chart: graduating vs non-graduating
    const data = [
        { name: 'Graduating', value: gradCount },
        { name: 'Non-Graduating', value: nonGraduating }
    ];

    const fetchMembersList = (category) => {
        const status = category === 'Graduating' ? 'Graduating' : 'Not Graduating';
        fetch(`/api/analytics/membersByGraduationStatus?status=${status}&organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
            .then((response) => response.json())
            .then((data) => {
                setMembersList(data);
            })
            .catch((error) => {
                console.error('Error fetching members list:', error);
                setMembersList([]);
            });
    };

    // Refresh chart and members list data
    const refreshData = () => {
        fetch(`/api/analytics/memberTallies?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
            .then((response) => response.json())
            .then((data) => setMemberTallies(data))
            .catch((error) => console.error('Error fetching member tallies:', error));
        fetch(`/api/analytics/membersByGraduation?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
            .then(response => response.json())
            .then(data => {
                setGradMembers(data);
                setGradCount(data.length);
            })
            .catch(error => console.error('Error fetching graduating members:', error));
        if (selectedCategory) {
            fetchMembersList(selectedCategory);
        }
    };

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Graduating Members</Typography>
            {totalMembers === 0 ? (
                <Typography variant="body1" color="text.secondary">No data to display</Typography>
            ) : (
                <>
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
                                    outerRadius={60}
                                    fill="#8884d8"
                                    labelLine={false}
                                    minAngle={50}
                                    onClick={(sliceData) => {
                                        const category = sliceData.name;
                                        setSelectedCategory(category);
                                        fetchMembersList(category);
                                        setDrawerOpen(true);
                                    }}
                                >
                                    <Label value={`${gradCount} / ${totalMembers}`} position="center" />
                                    {/* <Label value={`${totalMembers ? ((gradCount / totalMembers) * 100).toFixed(1) : 0}%`} position="center" /> */}
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.name === 'Graduating' ? 'rgb(75, 153, 105)' : '#8884d8'}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </>
            )}
            <NestedDrawers
                open={drawerOpen}
                detailsOpen={memberDrawerOpen}
                membersList={membersList}
                selectedMemberID={selectedMemberID}
                organizationID={organizationID}
                selectedSemester={selectedSemester}
                title={`${selectedCategory || 'Selected'} Members`}
                searchTerm={memberSearch}
                onSearchChange={setMemberSearch}
                onClose={() => {
                    setDrawerOpen(false);
                    setMemberDrawerOpen(false);
                }}
                onDetailsClose={() => setMemberDrawerOpen(false)}
                onItemSelect={(id) => {
                    setSelectedMemberID(id);
                    setMemberDrawerOpen(true);
                }}
                onAttendanceUpdate={refreshData}
            />
        </Paper>
    );
}