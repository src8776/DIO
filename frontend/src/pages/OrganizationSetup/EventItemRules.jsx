import * as React from 'react';
import {
    Container, Paper, Typography,
    Box, Table, TableHead,
    TableBody, TableRow, TableCell,
    IconButton, Button,
    TextField, Select, MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    width: { xs: '90%', sm: '500px', md: '600px' },
    maxWidth: '100%',
    maxHeight: '90%'
};

// Helper function to generate a readable description for a given rule
function generateRuleDescription(rule, ruleType) {
    const { criteria, criteriaValue, pointValue } = rule;

    // Use a switch-case (or if-else) to handle different rule types
    switch (ruleType) {
        case 'Threshold':
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

        case 'Points':
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

export default function EventItemRules({ name, rules, ruleType, orgID, occurrenceTotal, eventTypeID }) {
    const [open, setOpen] = React.useState(false);
    const [activeRequirement, setActiveRequirement] = React.useState(null);
    const [requirementType, setRequirementType] = React.useState('');
    const [selectedRule, setSelectedRule] = React.useState(null);
    const [newCriteriaType, setNewCriteriaType] = React.useState(null);
    const [newCriteriaValue, setNewCriteriaValue] = React.useState(null);
    const [newPointValue, setNewPointValue] = React.useState(1);
    const [editOccurrences, setEditOccurrences] = React.useState(false);
    const [currentOccurrenceTotal, setCurrentOccurrenceTotal] = React.useState(occurrenceTotal);
    const [newOccurrenceTotal, setNewOccurrenceTotal] = React.useState(occurrenceTotal);
    const [percentError, setPercentError] = React.useState('');
    const [pointError, setPointError] = React.useState('');
    const [occurrenceError, setOccurrenceError] = React.useState('');


    React.useEffect(() => {
        fetch(`/api/organizationInfo/activeRequirement?organizationID=${orgID}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    setActiveRequirement(data[0].ActiveRequirement); // Extract ActiveRequirement directly
                    setRequirementType(data[0].Description); // Extract RequirementType directly (either 'points' or 'criteria')
                } else {
                    setActiveRequirement(null);
                    setRequirementType(null);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setActiveRequirement(null);
                setRequirementType(null);
            });
    }, [orgID]);

    React.useEffect(() => {
        setCurrentOccurrenceTotal(occurrenceTotal);
        setNewOccurrenceTotal(occurrenceTotal);
    }, [occurrenceTotal]);

    const handleOpen = (rule) => {
        setSelectedRule(rule);
        setNewCriteriaType(rule.criteria);
        setNewCriteriaValue(rule.criteriaValue);
        setNewPointValue(rule.pointValue);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
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
                    // Update the rule in the local state
                    selectedRule.criteria = newCriteriaType;
                    selectedRule.criteriaValue = newCriteriaValue;
                    selectedRule.pointValue = newPointValue;
                    handleClose();
                } else {
                    console.error('Error updating rule:', data.error);
                }
            })
            .catch((error) => {
                console.error('Error updating rule:', error);
            });
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
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setCurrentOccurrenceTotal(parsedValue); // Update displayed value
                    setEditOccurrences(false);
                    setOccurrenceError('');
                } else {
                    setOccurrenceError('Failed to update occurrences');
                }
            })
            .catch((error) => {
                console.error('Error updating occurrences:', error);
                setOccurrenceError('An error occurred');
            });
    };

    return (
        <Container>
            <Paper elevation={1} sx={style}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Typography variant="h5" gutterBottom>
                        {name}
                    </Typography>
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
                                    Total Occurrences: {currentOccurrenceTotal}
                                </Typography>
                                <IconButton onClick={handleEditOccurrences} sx={{ color: '#015aa2' }}>
                                    <EditIcon />
                                </IconButton>
                            </>
                        )}
                    </Box>
                </Box>
                <Paper component="form" sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Rule Description</strong></TableCell>
                                {/* new rule button */}
                                {requirementType === 'criteria' ? (
                                    <>
                                        <TableCell />
                                    </>
                                ) : (
                                    <>
                                        <TableCell align='right'>
                                            <IconButton sx={{ color: '#08A045' }}>
                                                <AddCircleOutlineIcon />
                                            </IconButton>
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rules && rules.length > 0 ? (
                                rules.map((rule, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{rule.ruleID}</TableCell>
                                        <TableCell>{generateRuleDescription(rule, ruleType)}</TableCell>
                                        <TableCell align='right'>
                                            <IconButton onClick={() => handleOpen(rule)} sx={{ color: '#015aa2' }}>
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

                {/* Edit Options */}
                {open && (
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Updating Rule: {selectedRule.ruleID}
                        </Typography>

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
                                newCriteriaType === "per attendance" && <> "Earn 1 point per attendance"</> ||
                                newCriteriaType === "minimum threshold percentage" && <> "Earn 1 point for 50% attendance"</> ||
                                newCriteriaType === "minimum threshold hours" && <> "Earn 1 point for 3 hours attended"</>
                            )}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt:2, gap: 2 }}>
                            <Button variant="contained" color="primary" onClick={handleSaveRule}>
                                Save
                            </Button>
                            <Button variant="outlined" onClick={handleClose}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}