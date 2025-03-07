import * as React from 'react';
import {
    Typography, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, Paper, Box, Skeleton, Chip
} from "@mui/material";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

/**
 * Displays the member's attendance history in a table.
 */
export default function AttendanceHistory({ userAttendance, loading }) {
    const safeUserAttendance = Array.isArray(userAttendance) ? userAttendance : [];
    const sortedAttendance = [...safeUserAttendance].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

    return (
        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '45%' }, height: '390px', borderRadius: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EventAvailableIcon />
                <Typography variant="h5">Attendance History</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 370 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                </TableRow>
                            ))
                        ) : sortedAttendance.length > 0 ? (
                            sortedAttendance.map((record, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {record.eventType}
                                        {record.hours && (
                                            <Chip
                                                label={`${record.hours}h`}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(record.eventDate).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center">No attendance records found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}