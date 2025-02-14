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
} from "@mui/material";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RouteIcon from '@mui/icons-material/Route';

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
    p: 4,
    width: { xs: '90%', sm: '500px', md: '900px' },
    maxWidth: '100%'
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
                {/* Basic Info */}
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Account Overview - Women in Computing
                    {organization}
                </Typography>

                {/* Member Overview Container */}
                <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 3, p: 2, mb: 2 }}>
                    {/* Header box */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} >
                        <PeopleAltIcon />
                        <Typography variant="h5">
                            Member Overview
                        </Typography>
                    </Box>
                    {/* Content Box */}
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-around' }}>
                        {/* Active points box */}
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6">
                                Active Points
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: "green" }}>
                                18/18
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
                        {/* Meetings Attended box */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #CBCBCB', pl: 2 }}>
                            <Typography variant="h6">
                                Status
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: "green" }}>
                                Active
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Rewards and Past Events Container */}
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-around' }}>
                    {/* Rewards Container */}
                    <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', width: '50%', borderRadius: 3, p: 2, mb: 2 }}>
                        {/* Header box */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} >
                            <RouteIcon/>
                            <Typography variant="h5">
                                Active Path
                            </Typography>
                        </Box>
                        

                    </Paper>
                    {/* Past Events Container */}
                    <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', width: '50%', borderRadius: 3, p: 2, mb: 2 }}>
                        {/* Header box */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} >
                            <EventAvailableIcon />
                            <Typography variant="h5">
                                Attendance History
                            </Typography>
                        </Box>
                        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
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
            </Paper>
        </Container>
    );
};

export default AccountOverview;