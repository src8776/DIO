import React from "react";
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Button,
} from "@mui/material";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RouteIcon from '@mui/icons-material/Route';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

// TODO: This is where we want all of the user's information.

// TODO: Normalize this style for modals and house it somewhere else
const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    gap: 3,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    width: { xs: '90%', sm: '500px', md: '900px' },
    maxWidth: '100%',
    maxHeight: '90%',
};

const mockMemberData = {
    MemberID: 12345,
    UserName: "lse3284",
    FirstName: "Liam",
    LastName: "Edwards",
    Email: "lse3284@example.com",
    Major: "Computer Science",
    IsActive: true,
    GraduationYear: 2025,
    AcademicYear: "Senior",
    AttendanceHistory: [
        { date: "2025-01-20", event: "General Meeting" },
        { date: "2025-01-15", event: "Workshop" },
        { date: "2025-01-12", event: "General Meeting" },
        { date: "2025-01-10", event: "Volunteer" },
        { date: "2025-01-08", event: "Club Fair" },
        { date: "2025-01-06", event: "General Meeting" },
        { date: "2024-12-20", event: "Volunteer" },
        { date: "2024-12-15", event: "Holiday Celebration" },
        { date: "2024-12-10", event: "General Meeting" },
        { date: "2024-11-25", event: "Workshop" },
        { date: "2024-11-20", event: "Club Fair" },
        { date: "2024-11-15", event: "Volunteer" },
        { date: "2024-11-10", event: "General Meeting" },
        { date: "2024-10-30", event: "Halloween Social" },
        { date: "2024-10-25", event: "General Meeting" },
        { date: "2024-10-20", event: "Volunteer" },
        { date: "2024-10-15", event: "Club Fair" },
        { date: "2024-10-10", event: "Workshop" },
        { date: "2024-09-25", event: "General Meeting" },
        { date: "2024-09-20", event: "Volunteer" },
        { date: "2024-09-15", event: "Club Orientation" },
    ],
};

const AccountOverview = ({ userObj, organization }) => {

    return (
        <Container>
            <Paper sx={style}>
                <Box sx={{ overflowY: 'auto', p: 4 }}>

                    {/* Basic Info */}
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Account Overview-
                        {organization}
                    </Typography>

                    {/* Member Overview Container */}
                    <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 3, p: 2, mb: 2 }}>
                        {/* Header box */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} >
                            <PeopleAltIcon />
                            <Typography variant="h5">
                                Member Overview
                            </Typography>
                        </Box>
                        {/* Content Box */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-around', overflowX: 'auto' }}>
                            {/* Active points box */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6">
                                    Active Points
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: "green" }}>
                                    19/18
                                </Typography>
                            </Box>
                            {/* Status box */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #CBCBCB', pl: 2 }}>
                                <Typography variant="h6">
                                    Status
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: "green" }}>
                                    Active
                                </Typography>
                            </Box>
                            {/* Meetings Attended box */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #CBCBCB', pl: 2 }}>
                                <Typography variant="h6">
                                    Meetings Attended
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    53
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Rewards and Past Events Container */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        {/* Active Path Container */}
                        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '50%' }, height: '450px', borderRadius: 3 }}>
                            {/* Header box */}
                            <Box sx={{ display: 'flex', alignItems: 'center',  gap: 1, p:2}} >
                                <RouteIcon />
                                <Typography variant="h5">
                                    Active Path
                                </Typography>
                            </Box>
                            {/* Rule Categories */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' , overflowY: 'auto', p: 1, gap: 2}}>
                                <Paper sx={{ display: 'flex', flexDirection: 'column', p: 1, gap: 1, borderRadius: 3, }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Typography variant="h6">General Meetings</Typography>
                                        <Typography>16/18 attended</Typography>
                                    </Box>
                                    {/* Rule Modules */}
                                    <Paper elevation={1} sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', borderRadius: 2, p: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <RadioButtonCheckedIcon sx={{ color: '#F76902' }} />
                                            <Typography>+1 point per attendance</Typography>
                                        </Box>
                                        <Typography sx={{ color: "green" }}>16/18</Typography>
                                    </Paper>
                                    <Paper elevation={1} sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', borderRadius: 2, p: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <RadioButtonCheckedIcon sx={{ color: '#F76902' }} />
                                            <Typography>+1 point for 50% attendance</Typography>
                                        </Box>
                                        <Typography sx={{ color: "green" }}>+1</Typography>
                                    </Paper>
                                    <Paper elevation={1} sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', borderRadius: 2, p: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <RadioButtonCheckedIcon sx={{ color: '#F76902' }} />
                                            <Typography>+2 point for 75% attendance</Typography>
                                        </Box>
                                        <Typography sx={{ color: "green" }}>+2</Typography>
                                    </Paper>
                                    <Paper elevation={1} sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', borderRadius: 2, p: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <RadioButtonUncheckedIcon sx={{}} />
                                            <Typography>+3 point for 100% attendance</Typography>
                                        </Box>
                                        <Typography>+0</Typography>
                                    </Paper>
                                </Paper>
                                <Paper sx={{ display: 'flex', flexDirection: 'column', p: 1, gap: 1, borderRadius: 3, }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Typography variant="h6">Volunteer Events</Typography>
                                        <Typography>3 hours volunteered</Typography>
                                    </Box>
                                    {/* Rule Modules */}
                                    <Paper elevation={1} sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', borderRadius: 2, p: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <RadioButtonCheckedIcon sx={{ color: '#F76902' }} />
                                            <Typography>+1 point for 1 hour volunteered</Typography>
                                        </Box>
                                        <Typography sx={{ color: "green" }}>+1</Typography>
                                    </Paper>
                                    <Paper elevation={1} sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', borderRadius: 2, p: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <RadioButtonCheckedIcon sx={{ color: '#F76902' }} />
                                            <Typography>+2 points for 3 hours volunteered</Typography>
                                        </Box>
                                        <Typography sx={{ color: "green" }}>+1</Typography>
                                    </Paper>
                                    <Paper elevation={1} sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', borderRadius: 2, p: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <RadioButtonUncheckedIcon sx={{  }} />
                                            <Typography>+3 points for 6 hours volunteered</Typography>
                                        </Box>
                                        <Typography sx={{  }}>+0</Typography>
                                    </Paper>
                                    <Paper elevation={1} sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', borderRadius: 2, p: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <RadioButtonUncheckedIcon sx={{}} />
                                            <Typography>+4 points for 9 hours volunteered</Typography>
                                        </Box>
                                        <Typography>+0</Typography>
                                    </Paper>
                                </Paper>
                            </Box>


                        </Paper>
                        {/* Attendance History Container */}
                        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '50%' }, borderRadius: 3, p: 2 }}>
                            {/* Header box */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} >
                                <EventAvailableIcon />
                                <Typography variant="h5">
                                    Attendance History
                                </Typography>
                            </Box>
                            <TableContainer component={Paper} sx={{ maxHeight: 370 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Event</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {mockMemberData.AttendanceHistory && mockMemberData.AttendanceHistory.length > 0 ? (
                                            mockMemberData.AttendanceHistory.map((record, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{record.date}</TableCell>
                                                    <TableCell>{record.event}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    No attendance records found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default AccountOverview;