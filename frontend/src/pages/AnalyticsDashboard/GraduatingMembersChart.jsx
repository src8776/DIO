import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Box, Drawer, List,
    ListItem, ListItemText, TextField, IconButton, Tooltip as MuiTooltip
} from '@mui/material';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';
import CloseIcon from '@mui/icons-material/Close';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import MemberDetailsPage from '../MemberDetails/MemberDetailsPage';
import SnackbarAlert from '../../components/SnackbarAlert';

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
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

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

    const handleCopyEmails = () => {
        const emails = filteredMembers
            .filter(member => member.Email && member.Email.trim() !== '')
            .map(member => member.Email);
        if (emails.length === 0) {
            setSnackbarMessage('No emails to copy');
            setSnackbarOpen(true);
            return;
        }
        const emailString = emails.join(', ');
        navigator.clipboard.writeText(emailString)
            .then(() => {
                setSnackbarMessage(`${emails.length} email${emails.length === 1 ? '' : 's'} copied to your clipboard`);
                setSnackbarOpen(true);
            })
            .catch(err => {
                console.error('Failed to copy emails:', err);
                setSnackbarMessage('Failed to copy emails');
                setSnackbarOpen(true);
            });
    };

    const filteredMembers = Array.isArray(membersList) ? membersList.filter(member => {
        const fullName = `${member.FirstName} ${member.LastName}`.toLowerCase();
        return fullName.includes(memberSearch.toLowerCase());
    }) : [];

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
                                    <Label value={`${totalMembers ? ((gradCount / totalMembers) * 100).toFixed(1) : 0}%`} position="center" />
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
            {/* Members List Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setMemberDrawerOpen(false);
                }}
                sx={{
                    zIndex: 1200,
                    '& .MuiDrawer-paper': {
                        width: { xs: 300, sm: 400 },
                        left: 0
                    },
                }}
            >
                <Box sx={{ width: { xs: 300, sm: 400 }, p: 2, bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #ccc' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton onClick={() => {
                            setDrawerOpen(false);
                            setMemberDrawerOpen(false);
                        }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {selectedCategory} Members: {filteredMembers.length}
                        </Typography>
                        <MuiTooltip title="Copy emails to clipboard">
                            <IconButton
                                sx={{ alignSelf: 'flex-start' }}
                                onClick={handleCopyEmails}
                                disabled={filteredMembers.length === 0}
                                color="primary"
                            >
                                <ContactMailIcon />
                            </IconButton>
                        </MuiTooltip>
                    </Box>
                    <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Search members..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                        {filteredMembers.length > 0 ? (
                            <List dense>
                                {filteredMembers.map((member) => (
                                    <ListItem
                                        key={member.MemberID}
                                        button
                                        onClick={() => {
                                            setSelectedMemberID(member.MemberID);
                                            setMemberDrawerOpen(true);
                                        }}
                                        divider
                                        sx={{ py: 1, cursor: 'pointer' }}
                                    >
                                        <ListItemText primary={`${member.FirstName} ${member.LastName}`} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No members found
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Drawer>
            {/* Member Details Drawer */}
            <Drawer
                anchor="left"
                open={memberDrawerOpen}
                onClose={() => setMemberDrawerOpen(false)}
                variant="persistent"
                sx={{
                    zIndex: 1300,
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 500, md: 700 },
                        '@media (min-width:1102px)': {
                            left: 400,
                        }
                    }
                }}
            >
                <Box sx={{ width: { xs: '100%', sm: 500, md: 700 }, height: '100%', overflowY: 'auto' }}>
                    {selectedMemberID && (
                        <MemberDetailsPage
                            memberID={selectedMemberID}
                            orgID={organizationID}
                            selectedSemester={selectedSemester}
                            onClose={() => setMemberDrawerOpen(false)}
                            onAttendanceUpdate={refreshData}
                        />
                    )}
                </Box>
            </Drawer>
            <SnackbarAlert
                message={snackbarMessage}
                severity={snackbarMessage.includes('No emails') || snackbarMessage.includes('Failed') ? 'error' : 'success'}
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
            />
        </Paper>
    );
}