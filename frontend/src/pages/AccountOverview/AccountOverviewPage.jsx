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
    Button,
    Box,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

// TODO: Option to delete attendance records from the attendance history table here
//       - user feedback for deleting records ('this action cannot be undone', 'deleted successfully', etc.)? 

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

const AccountOverview = ({ memberData }) => {
    const {
        MemberID,
        UserName,
        FirstName,
        LastName,
        Email,
        Major,
        IsActive,
        GraduationYear,
        AcademicYear,
        AttendanceHistory,
    } = memberData || {};

    return (
        <Container>
            <Paper sx={style}>
                {/* Basic Info */}
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Account Overview - Women in Computing
                </Typography>

                {/* Member Overview Container */}
                <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: 3, p: 2, mb: 2 }}>
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
                                Awards Earned
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                1
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Rewards and Past Events Container */}
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-around' }}>
                    {/* Rewards Container */}
                    <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', width: '50%', backgroundColor: 'white', borderRadius: 3, p: 2, mb: 2 }}>
                        {/* Header box */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} >
                            <WorkspacePremiumIcon />
                            <Typography variant="h5">
                                Awards
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                background: "linear-gradient(135deg, gold, orange)", // Gold gradient
                                borderRadius: 3,
                                p: 2,
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", // Soft shadow for depth
                                textAlign: "center",
                                color: "white",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                border: "3px solid rgba(255, 215, 0, 0.8)", // Golden border
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: "'Cinzel', serif", // Fancy award-like font
                                    letterSpacing: 1,
                                    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)", // Elegant text glow
                                }}
                            >
                                Outstanding Achievement
                            </Typography>
                        </Box>

                    </Paper>
                    {/* Past Events Container */}
                    <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', width: '50%', backgroundColor: 'white', borderRadius: 3, p: 2, mb: 2 }}>
                        {/* Header box */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} >
                            <EventAvailableIcon />
                            <Typography variant="h5">
                                Past Events
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
                                    {AttendanceHistory && AttendanceHistory.length > 0 ? (
                                        AttendanceHistory.map((record, index) => (
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