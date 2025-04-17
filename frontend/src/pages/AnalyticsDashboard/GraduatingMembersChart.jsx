import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Box, ToggleButton, ToggleButtonGroup,
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
    const [showAlumni, setShowAlumni] = useState(false);
    const [alumniCount, setAlumniCount] = useState(0);

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

    // Fetch alumni members
    useEffect(() => {
        if (!organizationID) return;
        fetch(`/api/analytics/alumniMembers?organizationID=${organizationID}`)
            .then(response => response.json())
            .then(data => {
                setAlumniCount(data.length);
                if (showAlumni) {
                    setMembersList(data); // Update membersList when alumni toggle is active
                }
            })
            .catch(error => console.error('Error fetching alumni members:', error));
    }, [organizationID, showAlumni]);

    // Close drawers when semester changes to avoid outdated data
    useEffect(() => {
        setDrawerOpen(false);
        setMemberDrawerOpen(false);
    }, [selectedSemester.SemesterID]);

    const totalMembers = memberTallies?.totalMembers || 0;
    const nonGraduating = totalMembers - gradCount;

    // Data for the donut chart: graduating vs non-graduating or alumni
    const data = showAlumni
        ? [{ name: 'Alumni', value: alumniCount }]
        : [{ name: 'Graduating', value: gradCount }, { name: 'Non-Graduating', value: nonGraduating }];


    const fetchMembersList = (category) => {
        if (showAlumni) {
            // Alumni data is already fetched, no need for additional API calls
            setMembersList(category === 'Alumni' ? membersList : []);
            return;
        }

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
            <ToggleButtonGroup
                size='small'
                value={showAlumni ? 'alumni' : 'graduating'}
                exclusive
                onChange={(e, value) => {
                    if (value === 'alumni') {
                        setShowAlumni(true);
                        setSelectedCategory(null); // Reset selected category when toggling
                        setMembersList([]); // Clear members list to avoid stale data
                    } else if (value === 'graduating') {
                        setShowAlumni(false);
                        setSelectedCategory(null);
                        setMembersList([]);
                    }
                }}
                aria-label="Toggle Alumni or Graduating Members"
            >
                <ToggleButton value="graduating" aria-label="Graduating Members">
                    Graduating
                </ToggleButton>
                <ToggleButton value="alumni" aria-label="Alumni Members">
                    Alumni
                </ToggleButton>
            </ToggleButtonGroup>
            {totalMembers === 0 ? (
                <Typography variant="body1" color="text.secondary">No data to display</Typography>
            ) : (
                <>
                    {showAlumni && !alumniCount ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
                            <Typography variant="body1" color="text.secondary">No Alumni</Typography>
                        </Box>
                    ) : (
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
                                        <Label value={showAlumni ? `${alumniCount}\nAlumni` : `${gradCount} / ${totalMembers}`} position="center" />
                                        {data.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.name === 'Graduating' || entry.name === 'Alumni' ? 'rgb(75, 153, 105)' : '#8884d8'}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        ))}
                                    </Pie>
                                    {!showAlumni && <Tooltip />}
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    )}
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