import * as React from 'react';
import { Paper, Typography, Drawer, List, ListItem, ListItemText, TextField, IconButton, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Text } from 'recharts';
import CloseIcon from '@mui/icons-material/Close';
import MemberDetailsPage from '../MemberDetails/MemberDetailsPage';

export default function TotalMembersChart({ organizationID, selectedSemester }) {
    const [memberTallies, setMemberTallies] = React.useState(null);
    const [selectedCategory, setSelectedCategory] = React.useState(null);
    const [membersList, setMembersList] = React.useState([]);
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [selectedMemberID, setSelectedMemberID] = React.useState(null);
    const [memberDrawerOpen, setMemberDrawerOpen] = React.useState(false);
    const [memberSearch, setMemberSearch] = React.useState("");

    // Fetch member tallies when semester or organization changes
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

    // Close drawers when semester changes to prevent outdated data display
    React.useEffect(() => {
        setDrawerOpen(false);
        setMemberDrawerOpen(false);
    }, [selectedSemester]);

    // Function to fetch members list for a given category
    const fetchMembersList = (category) => {
        fetch(`/api/analytics/membersByStatusCategory?category=${category}&organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
            .then((response) => response.json())
            .then((data) => setMembersList(data))
            .catch((error) => {
                console.error('Error fetching members list:', error);
                setMembersList([]);
            });
    };

    // Function to refresh data when attendance is updated
    const refreshData = () => {
        fetch(`/api/analytics/memberTallies?organizationID=${organizationID}&semesterID=${selectedSemester.SemesterID}`)
            .then((response) => response.json())
            .then((data) => setMemberTallies(data))
            .catch((error) => console.error('Error fetching member tallies:', error));
        if (selectedCategory) {
            fetchMembersList(selectedCategory);
        }
    };

    if (!memberTallies) {
        return <div>Loading...</div>;
    }

    // Prepare data for the chart
    const activeMembers = Number(memberTallies.activeMembers);
    const generalMembers = Number(memberTallies.generalMembers);
    const totalMembers = Number(memberTallies.totalMembers);

    const data = [
        { name: 'Active', members: activeMembers },
        { name: 'General', members: generalMembers }
    ];

    const colors = ['#63993D', '#CA6C0F'];

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

    const minBarHeight = 15;

    const CustomBarShape = (props) => {
        const { x, y, width, height, fill } = props;
        const adjustedHeight = Math.max(height, minBarHeight);
        const adjustedY = height < minBarHeight ? y - (minBarHeight - height) : y;
        return (
            <rect
                x={x}
                y={adjustedY}
                width={width}
                height={adjustedHeight}
                fill={fill}
                pointerEvents="none"
            />
        );
    };

    // Custom background to make bars clickable
    const CustomBackground = (props) => {
        const { x, y, width, height, payload } = props;
        const adjustedHeight = Math.max(height, minBarHeight);
        const adjustedY = height < minBarHeight ? y - (minBarHeight - height) : y;
        return (
            <rect
                x={x}
                y={adjustedY}
                width={width}
                height={adjustedHeight}
                fill="transparent"
                pointerEvents="all"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    setSelectedCategory(payload.name);
                    fetchMembersList(payload.name);
                    setDrawerOpen(true);
                }}
            />
        );
    };

    // Filter members based on search input
    const filteredMembers = membersList.filter(member => {
        const fullName = `${member.FirstName} ${member.LastName}`.toLowerCase();
        return fullName.includes(memberSearch.toLowerCase());
    });

    return (
        <>
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
                    <Tooltip
                        formatter={(value) => `${value}`}
                        contentStyle={{ color: '#000' }}
                        labelStyle={{ color: '#000' }}
                    />
                    <Bar
                        dataKey="members"
                        label={renderBarLabel}
                        shape={<CustomBarShape />}
                        background={<CustomBackground />}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </Paper>
            {/* Members List Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setMemberDrawerOpen(false); // Close both drawers
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
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {selectedCategory} Members
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Members: {filteredMembers.length}
                    </Typography>
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
                            left: 400, // Shift right when members list drawer is open
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
        </>
    );
}