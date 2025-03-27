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
    DialogTitle, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';


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
    overflowY: 'auto'
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

export default function EventItemRules({ name, rules, ruleType, requirementType, maxPoints, orgID, occurrenceTotal, eventTypeID, semesterID, refetchEventRules, isEditable }) {
    const [editRuleOpen, setEditRuleOpen] = React.useState(false);
    const [activeRequirement, setActiveRequirement] = React.useState(null);
    const [selectedRule, setSelectedRule] = React.useState(null);
    const [newCriteriaType, setNewCriteriaType] = React.useState(null);
    const [newCriteriaValue, setNewCriteriaValue] = React.useState(0.00);
    const [newPointValue, setNewPointValue] = React.useState(1);
    const [editOccurrences, setEditOccurrences] = React.useState(false);
    const [currentOccurrenceTotal, setCurrentOccurrenceTotal] = React.useState(occurrenceTotal);
    const [newOccurrenceTotal, setNewOccurrenceTotal] = React.useState(occurrenceTotal);
    const [percentError, setPercentError] = React.useState('');
    const [pointError, setPointError] = React.useState('');
    const [occurrenceError, setOccurrenceError] = React.useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const [addRuleOpen, setAddRuleOpen] = React.useState(false);
    const [newRuleCriteriaType, setNewRuleCriteriaType] = React.useState('');
    const [newRuleCriteriaValue, setNewRuleCriteriaValue] = React.useState('');
    const [newRulePointValue, setNewRulePointValue] = React.useState(1);
    const [addPercentError, setAddPercentError] = React.useState('');
    const [addPointError, setAddPointError] = React.useState('');

    const [editMaxPoints, setEditMaxPoints] = React.useState(false);
    const [currentMaxPoints, setCurrentMaxPoints] = React.useState(maxPoints);
    const [newMaxPoints, setNewMaxPoints] = React.useState(maxPoints);
    const [maxPointsError, setMaxPointsError] = React.useState('');


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

    React.useEffect(() => {
        setCurrentOccurrenceTotal(occurrenceTotal);
        setNewOccurrenceTotal(occurrenceTotal);
    }, [occurrenceTotal]);

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
                    refetchEventRules();
                    handleEditRuleClose();
                } else {
                    console.error('Error updating rule:', data.error);
                }
            })
            .catch((error) => {
                console.error('Error updating rule:', error);
            });
    };

    const handleDeleteRule = () => {
        fetch('/api/organizationRules/deleteRule', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ruleID: selectedRule.ruleID,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    refetchEventRules();
                    setSelectedRule(null);
                    setEditRuleOpen(false);
                    setDeleteDialogOpen(false);
                } else {
                    console.error('Error deleting rule:', data.error);
                }
            })
            .catch((error) => {
                console.error('Error deleting rule:', error);
            });
    };

    const handleOpenDeleteDialog = () => {
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const handleEditOccurrences = () => {
        setEditOccurrences(true);
        setNewOccurrenceTotal(currentOccurrenceTotal);
    };

    const handleCancelEditOccurrences = () => {
        setEditOccurrences(false);
        setOccurrenceError('');
    };

    const handleSaveOccurrences = () => {
        const parsedValue = parseInt(newOccurrenceTotal, 10);
        if (isNaN(parsedValue) || parsedValue < 0) {
            setOccurrenceError('Total occurrences must be a non-negative number');
            return;
        }

        fetch('/api/organizationRules/updateOccurrences', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventTypeID,
                occurrences: parsedValue,
                semesterID,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setCurrentOccurrenceTotal(parsedValue); // Update displayed value
                    setEditOccurrences(false);
                    setOccurrenceError('');
                    refetchEventRules();
                } else {
                    setOccurrenceError('Failed to update occurrences');
                }
            })
            .catch((error) => {
                console.error('Error updating occurrences:', error);
                setOccurrenceError('An error occurred');
            });
    };

    const handleEditMaxPoints = () => {
        setEditMaxPoints(true);
        setNewMaxPoints(currentMaxPoints);
    };

    const handleCancelEditMaxPoints = () => {
        setEditMaxPoints(false);
        setMaxPointsError('');
    };

    const handleSaveMaxPoints = () => {
        const parsedValue = parseInt(newMaxPoints, 10);
        if (isNaN(parsedValue) || parsedValue < 0) {
            setMaxPointsError('Max points must be a non-negative number');
            return;
        }

        fetch('/api/organizationRules/updateMaxPoints', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventTypeID,
                maxPoints: parsedValue,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setCurrentMaxPoints(parsedValue);
                    setEditMaxPoints(false);
                    setMaxPointsError('');
                    refetchEventRules();
                } else {
                    setMaxPointsError('Failed to update max points');
                }
            })
            .catch((error) => {
                console.error('Error updating max points:', error);
                setMaxPointsError('An error occurred');
            });
    };

    const handleSaveNewRule = () => {
        // Reset errors
        setAddPercentError('');
        setAddPointError('');

        // Validate criteria type
        if (!newRuleCriteriaType) {
            setAddPercentError('Please select a criteria type');
            return;
        }

        // Handle criteria value
        let criteriaValue = 0.00; // Default to 0.00
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

        // Validate point value
        const pointValue = parseInt(newRulePointValue, 10);
        if (isNaN(pointValue) || pointValue < 1) {
            setAddPointError('Point value must be at least 1');
            return;
        }

        // Add New Rule
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
            .then(data => data.message === 'Rule added successfully' && (setAddRuleOpen(false), refetchEventRules()));
    };

    return (
        <Container>
            <Paper elevation={1} sx={modalStyle}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Typography variant="h5" gutterBottom>
                        {name}
                    </Typography>
                </Box>
                {isEditable && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {editOccurrences ? (
                            <>
                                <TextField
                                    label="Total Occurrences"
                                    value={newOccurrenceTotal}
                                    onChange={(e) => setNewOccurrenceTotal(e.target.value)}
                                    size="small"
                                    error={!!occurrenceError}
                                    helperText={occurrenceError}
                                    sx={{}}
                                />
                                <IconButton onClick={handleSaveOccurrences} sx={{ color: '#08A045' }}>
                                    <SaveIcon />
                                </IconButton>
                                <IconButton onClick={handleCancelEditOccurrences} sx={{ color: '#d32f2f' }}>
                                    <CancelIcon />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <Typography>
                                    Occurences Per Semester: {currentOccurrenceTotal}
                                </Typography>
                                <IconButton onClick={handleEditOccurrences} sx={{ color: '#015aa2' }}>
                                    <EditIcon />
                                </IconButton>
                            </>
                        )}
                    </Box>
                )}
                {/* display max points if it exists (not null) */}
                {requirementType === 'points' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2 }}>
                        {editMaxPoints ? (
                            <>
                                <TextField
                                    label="Max Points"
                                    value={newMaxPoints}
                                    onChange={(e) => setNewMaxPoints(e.target.value)}
                                    size="small"
                                    error={!!maxPointsError}
                                    helperText={maxPointsError}
                                />
                                <IconButton onClick={handleSaveMaxPoints} sx={{ color: '#08A045' }}>
                                    <SaveIcon />
                                </IconButton>
                                <IconButton onClick={handleCancelEditMaxPoints} sx={{ color: '#d32f2f' }}>
                                    <CancelIcon />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <Typography>
                                    Max Points: {currentMaxPoints !== null ? currentMaxPoints : 'no cap'}
                                </Typography>
                                {isEditable && (
                                    <IconButton onClick={handleEditMaxPoints} sx={{ color: '#015aa2' }}>
                                        <EditIcon />
                                    </IconButton>
                                )}
                            </>
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
                            {rules && rules.length > 0 ? (
                                rules.map((rule, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{rule.ruleID}</TableCell>
                                        <TableCell>{generateRuleDescription(rule, requirementType)}</TableCell>
                                        <TableCell align='right'>
                                            <IconButton onClick={() => {
                                                setAddRuleOpen(false);
                                                handleEditRuleOpen(rule);
                                            }
                                            }
                                                sx={{ color: '#015aa2' }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
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
                                Updating Rule: {selectedRule.ruleID}
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
                            {requirementType == 'criteria' ? (
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
                            <Button variant="outlined" onClick={handleEditRuleClose}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSaveRule}>
                                Save
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
                            <Button variant="outlined" onClick={() => setAddRuleOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSaveNewRule}>
                                Save
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
                        <Button onClick={handleCloseDeleteDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteRule} color="secondary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}