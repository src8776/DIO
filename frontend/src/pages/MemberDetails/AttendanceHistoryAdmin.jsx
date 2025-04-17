import * as React from 'react';
import {
    Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, Chip, Button, IconButton,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import AddAttendanceForm from './AddAttendanceForm';

/**
 * AttendanceHistoryAdmin.jsx
 * 
 * This React component renders a table displaying attendance records for a specific member.
 * It provides an admin interface for viewing, editing, and managing attendance records, including
 * options to delete records or add new attendance entries. The component supports both read-only
 * and edit modes, with dynamic updates based on user interactions.
 * 
 * Key Features:
 * - Displays a table of attendance records with sortable columns.
 * - Allows admins to toggle between read-only and edit modes.
 * - Provides options to delete attendance records.
 * - Includes a form for adding new attendance records.
 * - Handles scrolling behavior when toggling edit mode.
 * 
 * Props:
 * - attendanceRecords: Array of attendance record objects to display.
 * - editMode: Boolean indicating whether the component is in edit mode.
 * - setEditMode: Function to toggle the edit mode.
 * - selectedSemester: Object representing the currently selected semester.
 * - onDeleteClick: Function to handle the deletion of an attendance record.
 * - onAddAttendance: Function to handle the addition of a new attendance record.
 * - formData: Object containing the current form values for adding attendance.
 * - setFormData: Function to update the form values.
 * - eventTypeItems: Array of event type objects to populate the event type dropdown.
 * - semesterStart: String representing the start date of the semester.
 * - semesterEnd: String representing the end date of the semester.
 * 
 * Dependencies:
 * - React, Material-UI components, and icons.
 * - AddAttendanceForm: A custom component for adding attendance records.
 * 
 * Functions:
 * - handleToggleEdit: Toggles the edit mode and adjusts scrolling behavior.
 * 
 * Hooks:
 * - React.useRef: Used to reference the container for scrolling behavior.
 * 
 * @component
 */
export default function AttendanceHistoryAdmin({
    attendanceRecords, editMode, setEditMode, selectedSemester,
    onDeleteClick, onAddAttendance, formData,
    setFormData, eventTypeItems, semesterStart, semesterEnd
}) {
    const containerRef = React.useRef(null);

    const handleToggleEdit = () => {
        setEditMode(prev => {
            const newEditMode = !prev;
            if (newEditMode) {
                // Scroll to top of container when entering edit mode
                setTimeout(() => {
                    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 0);
            } else {
                // Scroll to top of page when exiting edit mode
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 0);
            }
            return newEditMode;
        });
    };

    return (
        <Paper elevation={1} ref={containerRef} sx={{ p: 2, scrollMarginTop: '130px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                <Typography variant="h6">Attendance History: {selectedSemester ? selectedSemester.TermName : "All Semesters"} </Typography>
                {selectedSemester && (
                    <Button variant="outlined" startIcon={editMode ? <DoneIcon /> : <EditIcon />} onClick={handleToggleEdit}>
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