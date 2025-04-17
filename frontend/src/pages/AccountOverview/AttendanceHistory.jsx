import * as React from 'react';
import {
    Typography, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, Paper, Box, Skeleton, Chip
} from "@mui/material";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

/**
 * AttendanceHistory.jsx
 * 
 * This React component displays a table summarizing the attendance history of a user.
 * It shows the events attended by the user along with their respective dates and durations.
 * The component supports loading states and dynamically updates based on the provided data.
 * 
 * Key Features:
 * - Displays a list of events attended by the user, sorted by date (most recent first).
 * - Shows event names, dates, and optional duration (in hours) as chips.
 * - Supports loading states with skeleton placeholders for a better user experience.
 * - Handles cases where no attendance records are available.
 * 
 * Props:
 * - userAttendance: Array of attendance records, where each record contains event details.
 * - loading: Boolean indicating whether the data is still loading.
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * 
 * Functions:
 * - sortedAttendance: Sorts the attendance records by event date in descending order.
 * 
 * @component
 */
export default function AttendanceHistory({ userAttendance, loading }) {
    const safeUserAttendance = Array.isArray(userAttendance) ? userAttendance : [];
    const sortedAttendance = [...safeUserAttendance].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

    return (
        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', flex: 1, maxHeight: '500px', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2}}>
                <EventAvailableIcon />
                <Typography variant="h5">Attendance History</Typography>
            </Box>
            <TableContainer >
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