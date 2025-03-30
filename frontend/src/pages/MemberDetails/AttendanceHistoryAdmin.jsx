import * as React from 'react';
import {
    Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, Chip, Button, IconButton,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import AddAttendanceForm from './AddAttendanceForm';


export default function AttendanceHistoryAdmin({
    attendanceRecords,
    editMode,
    setEditMode,
    selectedSemester,
    onDeleteClick,
    onAddAttendance,
    formData,
    setFormData,
    eventTypeItems,
    semesterStart,
    semesterEnd
}) {

    return (
        <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                <Typography variant="h6">Attendance History: {selectedSemester ? selectedSemester.TermName : "All Semesters"} </Typography>
                {selectedSemester && (
                    <Button variant="outlined" startIcon={editMode ? <DoneIcon /> : <EditIcon />} onClick={() => setEditMode(!editMode)}>
                        {editMode ? 'Done Editing' : 'Edit Attendance'}
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Event ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Event Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Event Title</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Check-in</TableCell>
                            {editMode && <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attendanceRecords && attendanceRecords.length > 0 ? (
                            attendanceRecords
                                .sort((a, b) => new Date(b.CheckInTime) - new Date(a.CheckInTime))
                                .map((record, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{record.EventID}</TableCell>
                                        <TableCell>
                                            {record.EventType}
                                            {record.Hours && <Chip label={`${record.Hours}h`} size="small" sx={{ ml: 1 }} />}
                                        </TableCell>
                                        <TableCell>{record.EventTitle || 'N/A'}</TableCell>
                                        <TableCell>{new Date(record.CheckInTime).toLocaleString()}</TableCell>
                                        {editMode && (
                                            <TableCell>
                                                <IconButton onClick={() => onDeleteClick(record)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={editMode ? 5 : 4} align="center">
                                    <Typography variant="body2" color="text.secondary">No attendance records found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {editMode && (
                <AddAttendanceForm
                    formData={formData}
                    setFormData={setFormData}
                    eventTypeItems={eventTypeItems}
                    semesterStart={semesterStart}
                    semesterEnd={semesterEnd}
                    onSubmit={onAddAttendance}
                />
            )}
        </Paper>
    );
}