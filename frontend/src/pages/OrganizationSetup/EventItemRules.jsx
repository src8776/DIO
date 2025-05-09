import * as React from 'react';
import {
    Container, Paper, Typography,
    Box, Table, TableHead,
    TableBody, TableRow, TableCell,
    IconButton, Button,
    TextField, Select, MenuItem,
    FormControl, InputLabel,
    Dialog, DialogActions,
    DialogContent, DialogContentText,
    DialogTitle, Divider, Checkbox, FormControlLabel,
    CircularProgress
} from '@mui/material';
import SnackbarAlert from '../../components/SnackbarAlert';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * EventItemRules.jsx
 * 
 * This React component renders a detailed interface for managing the rules associated with a specific event type.
 * It allows administrators to view, edit, add, and delete rules for an event, as well as update event settings such as
 * occurrences per semester and maximum points. The component dynamically fetches and updates event data from the backend
 * and provides feedback through a SnackbarAlert.
 * 
 * Key Features:
 * - Displays a list of rules associated with the event type.
 * - Allows administrators to add new rules, edit existing rules, or delete rules.
 * - Provides options to edit event settings, such as occurrences per semester and maximum points.
 * - Validates input for rules and event settings to ensure data integrity.
 * - Handles re-evaluation of member statuses after rule or event updates.
 * - Displays feedback on success or failure using a SnackbarAlert.
 * 
 * Props:
 * - name: String representing the name of the event type.
 * - rules: Array of rule objects associated with the event type.
 * - ruleType: String representing the type of rules (e.g., "Attendance" or "Points").
 * - requirementType: String representing the requirement type for the event (e.g., "criteria" or "points").
 * - maxPoints: Number representing the maximum points for the event.
 * - orgID: String or number representing the organization ID.
 * - occurrenceTotal: Number representing the total occurrences of the event per semester.
 * - eventTypeID: String or number representing the event type ID.
 * - semesterID: String or number representing the semester ID.
 * - isEditable: Boolean indicating whether the event rules and settings can be edited.
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * - SnackbarAlert: A custom component for displaying alerts.
 * 
 * Functions:
 * - generateRuleDescription: Generates a human-readable description for a given rule.
 * - fetchUpdatedEventData: Fetches the latest event data from the backend.
 * - handleEditEvent: Enables editing mode for event settings.
 * - handleSaveEvent: Validates and submits updated event settings to the backend.
 * - handleDeleteEvent: Deletes the event type and its associated rules.
 * - handleEditRuleOpen: Opens the form for editing a specific rule.
 * - handleSaveRule: Validates and submits updates to a specific rule.
 * - handleDeleteRule: Deletes a specific rule from the backend.
 * - handleSaveNewRule: Validates and submits a new rule to the backend.
 * - handleReEvaluateStatus: Re-evaluates member statuses after rule or event updates.
 * 
 * Hooks:
 * - React.useState: Manages state for event data, rules, editing modes, errors, and UI interactions.
 * - React.useEffect: Fetches initial data for the event and active requirements when dependencies change.
 * 
 * @component
 */

const modalStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    width: { xs: '90%', sm: '500px', md: '600px' },
    maxWidth: '100%',
    maxHeight: '90%',
    overflowY: 'auto',
};

// Helper function to generate a readable description for a given rule
function generateRuleDescription(rule, requirementType) {
    const { criteria, criteriaValue, pointValue } = rule;

    // Use a switch-case (or if-else) to handle different rule types
    switch (requirementType) {
        case 'criteria':
            switch (criteria) {
                case 'minimum threshold percentage': {
                    // e.g., { criteria: "minimum threshold percentage", criteriaValue: 0.5, pointValue: 1 }
                    const percentage = criteriaValue * 100;
                    return `attend at least ${percentage}% of events`;
                }
                case 'one off': {
                    return `attend at least one event`;
                }
            }
        case 'points':
            switch (criteria) {
                case 'attendance':
                    // e.g., { criteria: "attendance", criteriaValue: null, pointValue: 1 }
                    return `+${pointValue} point${pointValue !== 1 ? 's' : ''} per attendance`;

                case 'minimum threshold percentage': {
                    // e.g., { criteria: "minimum threshold percentage", criteriaValue: 0.5, pointValue: 1 }
                    const percentage = criteriaValue * 100;
                    return `+${pointValue} point${pointValue !== 1 ? 's' : ''} for ${percentage}% attendance`;
                }

                case 'minimum threshold hours': {
                    // e.g., { criteria: "minimum threshold hours", criteriaValue: 3, pointValue: 1 }
                    return `+${pointValue} point${pointValue !== 1 ? 's' : ''} for ${criteriaValue} hour${criteriaValue !== 1 ? 's' : ''} volunteered`;
                }

                case 'one off': {
                    return `+${pointValue} point${pointValue !== 1 ? 's' : ''} for first attendance`;
                }
            }
    }
}

export default function EventItemRules({ name, rules, ruleType, requirementType, maxPoints, orgID, occurrenceTotal, eventTypeID, semesterID, isEditable }) {
    const [editRuleOpen, setEditRuleOpen] = React.useState(false);
    const [activeRequirement, setActiveRequirement] = React.useState(null);
    const [selectedRule, setSelectedRule] = React.useState(null);
    const [newCriteriaType, setNewCriteriaType] = React.useState(null);
    const [newCriteriaValue, setNewCriteriaValue] = React.useState(0.00);
    const [newPointValue, setNewPointValue] = React.useState(1);
    const [percentError, setPercentError] = React.useState('');
    const [pointError, setPointError] = React.useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const [addRuleOpen, setAddRuleOpen] = React.useState(false);
    const [newRuleCriteriaType, setNewRuleCriteriaType] = React.useState('');
    const [newRuleCriteriaValue, setNewRuleCriteriaValue] = React.useState('');
    const [newRulePointValue, setNewRulePointValue] = React.useState(1);
    const [addPercentError, setAddPercentError] = React.useState('');
    const [addPointError, setAddPointError] = React.useState('');

    const [isEditingEvent, setIsEditingEvent] = React.useState(false);
    const [editedOccurrenceTotal, setEditedOccurrenceTotal] = React.useState(occurrenceTotal);
    const [editedHasMaxPoints, setEditedHasMaxPoints] = React.useState(maxPoints !== null);
    const [editedMaxPoints, setEditedMaxPoints] = React.useState(maxPoints || 0);
    const [occurrenceError, setOccurrenceError] = React.useState('');
    const [maxPointsError, setMaxPointsError] = React.useState('');
    const [deleteEventDialogOpen, setDeleteEventDialogOpen] = React.useState(false);
    const [attendanceCount, setAttendanceCount] = React.useState(0);

    const [eventData, setEventData] = React.useState({ name, rules, ruleType, maxPoints, occurrenceTotal });
    const [loading, setLoading] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Function to fetch updated event data
    const fetchUpdatedEventData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/organizationRules/eventRulesByType?eventTypeID=${eventTypeID}&semesterID=${semesterID}`);
            const data = await response.json();
            if (data.rules) {
                setEventData({
                    name: data.rules.name,
                    rules: data.rules.rules,
                    ruleType: data.rules.ruleType,
                    maxPoints: data.rules.maxPoints,
                    occurrenceTotal: data.rules.occurrenceTotal,
                });
            } else {
                console.error('Error fetching updated event data:', data.error);
            }
        } catch (error) {
            console.error('Error fetching updated event data:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (orgID && semesterID) {
            fetch(`/api/organizationInfo/activeRequirement?organizationID=${orgID}&semesterID=${semesterID}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        setActiveRequirement(data[0].ActiveRequirement);
                    }
                })
                .catch(error => console.error('Error fetching active requirement:', error));
        }
    }, [orgID, semesterID]);

    const fetchAttendanceCount = async () => {
        try {
            const response = await fetch(`/api/organizationRules/getAttendanceCount?eventTypeID=${eventTypeID}`);
            const data = await response.json();
            if (data.attendanceCount !== undefined) {
                setAttendanceCount(data.attendanceCount);
            } else {
                console.error('Error fetching attendance count:', data.error);
                setAttendanceCount(0);
            }
        } catch (error) {
            console.error('Error fetching attendance count:', error);
            setAttendanceCount(0);
        }
    };

    const handleOpenDeleteEventDialog = async () => {
        await fetchAttendanceCount();
        setDeleteEventDialogOpen(true);
    };

    const handleEditEvent = () => {
        setEditedOccurrenceTotal(occurrenceTotal);
        setEditedHasMaxPoints(maxPoints !== null);
        setEditedMaxPoints(maxPoints || 0);
        setIsEditingEvent(true);
    };

    const handleReEvaluateStatus = async () => {
        try {
            const response = await fetch('/api/reEvaluateStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orgID,
                    selectedSemester: { SemesterID: semesterID }
                })
            });
            const reEvalData = await response.json();
            if (reEvalData.success) {
                const message = `Successfully re-evaluated ${reEvalData.totalMembers} members: 
                    ${reEvalData.updatedMembers} updated, ${reEvalData.exemptMembers} exempt 
                    (took ${Math.round(reEvalData.processingTimeMs / 1000 * 10) / 10}s)`;
                setSnackbar({
                    open: true,
                    message,
                    severity: 'success'
                });
            } else {
                console.error('Error re-evaluating member statuses:', reEvalData.error);
                setSnackbar({
                    open: true,
                    message: `Error: ${reEvalData.error || 'Failed to re-evaluate member statuses'}`,
                    severity: 'error'
                });
            }
        } catch (error) {
            console.error('Error re-evaluating member statuses:', error);
            setSnackbar({
                open: true,
                message: 'Error: Failed to re-evaluate member statuses',
                severity: 'error'
            });
        }
    };

    const handleSaveEvent = () => {
        setOccurrenceError('');
        setMaxPointsError('');
        setLoading(true);

        const parsedOccurrences = parseInt(editedOccurrenceTotal, 10);
        if (isNaN(parsedOccurrences) || parsedOccurrences < 0) {
            setOccurrenceError('Total occurrences must be a non-negative integer');
            setLoading(false);
            return;
        }

        let parsedMaxPoints = null;
        if (editedHasMaxPoints) {
            parsedMaxPoints = parseInt(editedMaxPoints, 10);
            if (isNaN(parsedMaxPoints) || parsedMaxPoints < 1) {
                setMaxPointsError('Max points must be a positive integer');
                setLoading(false);
                return;
            }
        }

        fetch('/api/organizationRules/updateOccurrences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventTypeID,
                occurrences: parsedOccurrences,
                semesterID,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    setOccurrenceError('Failed to update occurrences');
                    throw new Error('Failed to update occurrences');
                }
                return fetch('/api/organizationRules/updateMaxPoints', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventTypeID,
                        maxPoints: editedHasMaxPoints ? parsedMaxPoints : null,
                    }),
                });
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    setMaxPointsError('Failed to update max points');
                    throw new Error('Failed to update max points');
                }
                // refetchEventRules();
                setSnackbar({
                    open: true,
                    message: 'Event updated successfully',
                    severity: 'success',
                });
                return handleReEvaluateStatus();
            })
            .catch(error => {
                console.error('Error updating event:', error);
                setSnackbar({
                    open: true,
                    message: 'Error: Failed to update event',
                    severity: 'error',
                });
            })
            .finally(() => {
                fetchUpdatedEventData();
                setLoading(false);
            });
    };

    const handleDeleteEvent = () => {
        setLoading(true);
        fetch('/api/organizationRules/deleteEventType', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventTypeID }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setDeleteEventDialogOpen(false);
                    setIsEditingEvent(false);
                    return handleReEvaluateStatus();
                } else {
                    console.error('Error deleting event type:', data.error);
                    setSnackbar({
                        open: true,
                        message: 'Error: Failed to delete event type',
                        severity: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Error deleting event type:', error);
                setSnackbar({
                    open: true,
                    message: 'Error: Failed to delete event type',
                    severity: 'error'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEditRuleOpen = (rule) => {
        setSelectedRule(rule);
        setNewCriteriaType(rule.criteria);
        setNewCriteriaValue(rule.criteriaValue);
        setNewPointValue(rule.pointValue);
        setEditRuleOpen(true);
    };

    const handleEditRuleClose = () => {
        setEditRuleOpen(false);
        setSelectedRule(null);
        setNewCriteriaValue('');
        setNewPointValue('');
        setPercentError('');
        setPointError('');
    };

    const handleSaveRule = () => {
        if (newCriteriaType === 'minimum threshold percentage') {
            if (newCriteriaValue < 0.01 || newCriteriaValue > 1) {
                setPercentError('Percentage value must be between 0.01 and 1');
                return;
            }
        }

        if (newPointValue < 1) {
            setPointError('Point value must be at least 1');
            return;
        }

        setLoading(true);
        fetch('/api/organizationRules/updateRule', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ruleID: selectedRule.ruleID,
                criteriaType: newCriteriaType,
                criteriaValue: newCriteriaValue,
                pointValue: newPointValue,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    // refetchEventRules(); // Fetch updated rules
                    setSnackbar({
                        open: true,
                        message: 'Rule updated successfully',
                        severity: 'success',
                    });
                    return handleReEvaluateStatus();
                } else {
                    console.error('Error updating rule:', data.error);
                    setSnackbar({
                        open: true,
                        message: 'Error: Failed to update rule',
                        severity: 'error',
                    });
                }
            })
            .catch((error) => {
                console.error('Error updating rule:', error);
                setSnackbar({
                    open: true,
                    message: 'Error: Failed to update rule',
                    severity: 'error',
                });
            })
            .finally(() => {
                fetchUpdatedEventData();
                setLoading(false);
            });
    };

    const handleDeleteRule = () => {
        setLoading(true);
        fetch('/api/organizationRules/deleteRule', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ruleID: selectedRule?.ruleID,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    // refetchEventRules();
                    setSnackbar({
                        open: true,
                        message: 'Rule deleted successfully',
                        severity: 'success',
                    });
                    // Keep modal open: only reset selection
                    setSelectedRule(null);
                    setDeleteDialogOpen(false);
                    return handleReEvaluateStatus();
                } else {
                    console.error('Error deleting rule:', data.error);
                    setSnackbar({
                        open: true,
                        message: 'Error: Failed to delete rule',
                        severity: 'error',
                    });
                }
            })
            .catch((error) => {
                console.error('Error deleting rule:', error);
                setSnackbar({
                    open: true,
                    message: 'Error: Failed to delete rule',
                    severity: 'error',
                });
            })
            .finally(() => {
                fetchUpdatedEventData();
                handleEditRuleClose();
                setLoading(false);
            });
    };

    const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
    const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

    const handleSaveNewRule = () => {
        setAddPercentError('');
        setAddPointError('');

        if (!newRuleCriteriaType) {
            setAddPercentError('Please select a criteria type');
            return;
        }

        let criteriaValue = 0.00;
        if (newRuleCriteriaType === 'minimum threshold percentage' || newRuleCriteriaType === 'minimum threshold hours') {
            criteriaValue = parseFloat(newRuleCriteriaValue);
            if (isNaN(criteriaValue) || criteriaValue <= 0) {
                setAddPercentError('Criteria value must be a positive number');
                return;
            }
            if (newRuleCriteriaType === 'minimum threshold percentage' && (criteriaValue < 0.01 || criteriaValue > 1)) {
                setAddPercentError('Percentage must be between 0.01 and 1');
                return;
            }
        }

        const pointValue = parseInt(newRulePointValue, 10);
        if (isNaN(pointValue) || pointValue < 1) {
            setAddPointError('Point value must be at least 1');
            return;
        }

        setLoading(true);
        fetch('/api/organizationRules/addRule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orgID,
                eventTypeID,
                semesterID,
                criteria: newRuleCriteriaType,
                criteriaValue,
                pointValue,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Rule added successfully') {
                    // refetchEventRules();
                    setSnackbar({
                        open: true,
                        message: 'Rule added successfully',
                        severity: 'success',
                    });
                    return handleReEvaluateStatus();
                } else {
                    setSnackbar({
                        open: true,
                        message: 'Error: Failed to add rule',
                        severity: 'error',
                    });
                }
            })
            .catch(error => {
                console.error('Error adding rule:', error);
                setSnackbar({
                    open: true,
                    message: 'Error: Failed to add rule',
                    severity: 'error',
                });
            })
            .finally(() => {
                fetchUpdatedEventData();
                setAddRuleOpen(false);
                setLoading(false);
            });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Container>
            <Paper elevation={1} sx={modalStyle}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h5">
                        {eventData.name}
                    </Typography>
                    {isEditable && !isEditingEvent && (
                        <Button
                            startIcon={<EditIcon />}
                            onClick={handleEditEvent}
                            sx={{ color: '#015aa2' }}
                        >
                            Edit Event
                        </Button>
                    )}
                </Box>
                {isEditingEvent ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 2 }}>
                        <TextField
                            label="Total Occurrences"
                            value={editedOccurrenceTotal}
                            onChange={(e) => setEditedOccurrenceTotal(e.target.value)}
                            size="small"
                            error={!!occurrenceError}
                            helperText={occurrenceError}
                        />
                        {eventData.ruleType === 'Points' && (
                            <>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={editedHasMaxPoints}
                                            onChange={(e) => setEditedHasMaxPoints(e.target.checked)}
                                        />
                                    }
                                    label="Set max points"
                                />
                                {editedHasMaxPoints && (
                                    <TextField
                                        label="Max Points"
                                        value={editedMaxPoints}
                                        onChange={(e) => setEditedMaxPoints(e.target.value)}
                                        size="small"
                                        error={!!maxPointsError}
                                        helperText={maxPointsError}
                                        type='number'
                                    />
                                )}
                            </>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            
                            <Button variant="contained" color="error" onClick={handleOpenDeleteEventDialog}>
                                Delete Event
                            </Button>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" onClick={() => setIsEditingEvent(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveEvent}
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={24} /> : null}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ pb: 1 }}>
                        <Typography>
                            Occurrences Per Semester: {eventData.occurrenceTotal}
                        </Typography>
                        {eventData.ruleType === 'Points' && (
                            <Typography>
                                Max Points: {maxPoints !== null ? maxPoints : 'no cap'}
                            </Typography>
                        )}
                    </Box>
                )}

                <Paper component="form" sx={{ width: '100%' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Rule Description</strong></TableCell>
                                {/* new rule button */}
                                {isEditable && (requirementType === 'criteria' && rules.length === 1 ? (
                                    <TableCell />
                                ) : (
                                    <TableCell align="right">
                                        <Button
                                            startIcon={<AddCircleOutlineIcon />}
                                            sx={{ color: '#08A045', justifyContent: 'center', minWidth: '120px' }}
                                            onClick={() => {
                                                setEditRuleOpen(false);
                                                setAddRuleOpen(true);
                                            }}
                                        >
                                            Add Rule
                                        </Button>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {eventData.rules && eventData.rules.length > 0 ? (
                                eventData.rules.map((rule, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{rule.ruleID}</TableCell>
                                        <TableCell>{generateRuleDescription(rule, requirementType)}</TableCell>
                                        {isEditable && (
                                            <TableCell align='right'>
                                                <IconButton
                                                    onClick={() => {
                                                        setAddRuleOpen(false);
                                                        handleEditRuleOpen(rule);
                                                    }}
                                                    sx={{ color: '#015aa2' }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No rules available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>

                {/* Edit Rule Form */}
                {editRuleOpen && (
                    <Box sx={{ width: '100%', pt: 2 }}>
                        <Divider />
                        <Box sx={{ pt: 2, pb: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Typography variant="h6">
                                Updating Rule: {selectedRule?.ruleID}
                            </Typography>
                            <Button onClick={handleOpenDeleteDialog} startIcon={<DeleteIcon />} sx={{ color: '#d32f2f' }}>
                                Delete Rule
                            </Button>
                        </Box>

                        <FormControl>
                            <InputLabel id="criteria-select-label">Criteria Type</InputLabel>
                            <Select
                                labelId='criteria-select-label'
                                label="Criteria Type"
                                value={newCriteriaType}
                                onChange={(e) => setNewCriteriaType(e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="one off">One Off</MenuItem>
                                {requirementType === 'points' && <MenuItem value="attendance">Per Attendance</MenuItem>}
                                <MenuItem value="minimum threshold percentage">Minimum Threshold Percentage</MenuItem>
                                <MenuItem value="minimum threshold hours">Minimum Threshold Hours</MenuItem>
                            </Select>
                        </FormControl>

                        {selectedRule && newCriteriaType !== 'attendance' && newCriteriaType !== 'one off' && (
                            <TextField
                                label="Criteria Value"
                                value={newCriteriaValue}
                                onChange={(e) => setNewCriteriaValue(e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                                error={!!percentError}
                                helperText={percentError}
                            />
                        )}
                        {requirementType === 'points' && (
                            <TextField
                                label="Point Value"
                                value={newPointValue}
                                onChange={(e) => setNewPointValue(e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                                error={!!pointError}
                                helperText={pointError}
                            />
                        )}
                        <Typography>
                            Example:
                            {requirementType === 'criteria' ? (
                                newCriteriaType === "one off" && <> "Attend at least one event"</> ||
                                newCriteriaType === "minimum threshold percentage" && <> "Attend at least 50% of events"</> ||
                                newCriteriaType === "minimum threshold hours" && <> "Attend event for at least 5 hours"</>
                            ) : (
                                newCriteriaType === "one off" && <> "Earn 1 point for your first attendance"</> ||
                                newCriteriaType === "attendance" && <> "Earn 1 point per attendance"</> ||
                                newCriteriaType === "minimum threshold percentage" && <> "Earn 1 point for 50% attendance"</> ||
                                newCriteriaType === "minimum threshold hours" && <> "Earn 1 point for 3 hours attended"</>
                            )}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                            <Button variant="outlined" onClick={handleEditRuleClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveRule}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={24} /> : null}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Add Rule Form */}
                {addRuleOpen && (
                    <Box sx={{ width: '100%', pt: 2 }}>
                        <Divider />
                        <Typography variant="h6" sx={{ pt: 2, pb: 2 }}>
                            Add New Rule
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel id="new-rule-criteria-select-label">Criteria Type</InputLabel>
                            <Select
                                labelId="new-rule-criteria-select-label"
                                label="Criteria Type"
                                value={newRuleCriteriaType}
                                onChange={(e) => setNewRuleCriteriaType(e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="attendance">Per Attendance</MenuItem>
                                <MenuItem value="one off">One Off</MenuItem>
                                <MenuItem value="minimum threshold percentage">Minimum Threshold Percentage</MenuItem>
                                <MenuItem value="minimum threshold hours">Minimum Threshold Hours</MenuItem>
                            </Select>
                        </FormControl>
                        {newRuleCriteriaType !== 'attendance' && newRuleCriteriaType !== 'one off' && (
                            <TextField
                                label="Criteria Value"
                                value={newRuleCriteriaValue}
                                onChange={(e) => setNewRuleCriteriaValue(e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                                error={!!addPercentError}
                                helperText={addPercentError}
                            />
                        )}
                        <TextField
                            label="Point Value"
                            value={newRulePointValue}
                            onChange={(e) => setNewRulePointValue(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!addPointError}
                            helperText={addPointError}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                            <Button variant="outlined" onClick={() => setAddRuleOpen(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveNewRule}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={24} /> : null}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </Box>
                    </Box>
                )}

                <Dialog
                    open={deleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                >
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this rule?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog} color="primary" disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteRule}
                            color="secondary"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={24} /> : null}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={deleteEventDialogOpen}
                    onClose={() => setDeleteEventDialogOpen(false)}
                >
                    <DialogTitle>
                        {attendanceCount > 0 ? "Cannot Delete" : "Confirm Deletion"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {attendanceCount > 0 ? (
                                <>
                                    This event type cannot be deleted because it has
                                    <span style={{ fontWeight: 'bold', color: '#d32f2f' }}> {attendanceCount} </span>
                                    attendance record{attendanceCount > 1 ? 's' : ''} associated with it. <br />
                                </>
                            ) : (
                                <>
                                    Are you sure you want to delete this event type? <br />
                                    This will delete all associated event rules.
                                </>
                            )}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        {attendanceCount > 0 ? (
                            <Button onClick={() => setDeleteEventDialogOpen(false)} color="primary">
                                Close
                            </Button>
                        ) : (
                            <>
                                <Button onClick={() => setDeleteEventDialogOpen(false)} color="primary" disabled={loading}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteEvent}
                                    color="secondary"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={24} /> : null}
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </Button>
                            </>
                        )}
                    </DialogActions>
                </Dialog>

                <SnackbarAlert
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={handleSnackbarClose}
                />
            </Paper>
        </Container>
    );
}