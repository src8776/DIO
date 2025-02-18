import * as React from 'react';
import {
    Container, Paper, Typography,
    Box, Table, TableHead,
    TableBody, TableRow, TableCell,
    IconButton, Button,
    TextField
} from '@mui/material';
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

export default function EventItemRules({ name, rules, ruleType, orgID }) {
    const [open, setOpen] = React.useState(false);
    const [selectedRule, setSelectedRule] = React.useState(null);
    const [newCriteriaValue, setNewCriteriaValue] = React.useState(null);
    const [newPointValue, setNewPointValue] = React.useState(null);
    const [percentError, setPercentError] = React.useState('');
    const [pointError, setPointError] = React.useState('');

    const handleOpen = (rule) => {
        setSelectedRule(rule);
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

    const handleSave = () => {
        if (selectedRule.criteria === 'minimum threshold percentage') {
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
                criteriaValue: newCriteriaValue,
                pointValue: newPointValue,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    // Update the rule in the local state
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

    return (
        <Container>
            <Paper elevation={1} sx={style}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Typography variant="h5" gutterBottom>
                        {name}
                    </Typography>

                </Box>
                <Paper component="form" sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Rule Description</strong></TableCell>
                                {/* new rule button */}
                                <TableCell align='right'>
                                    <IconButton sx={{ color: '#08A045' }}>
                                        <AddCircleOutlineIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rules && rules.length > 0 ? (
                                rules.map((rule, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{rule.ruleID}</TableCell>
                                        <TableCell>{generateRuleDescription(rule, ruleType)}</TableCell>
                                        <TableCell align='right'>
                                            {rule.criteria !== 'one off' && (
                                                <IconButton onClick={() => handleOpen(rule)} sx={{ color: '#015aa2' }}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
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

                {open && (
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Updating Rule: {selectedRule.ruleID}
                        </Typography>
                        {selectedRule && selectedRule.criteria !== 'attendance' && selectedRule.criteria !== 'one off' && (
                            <TextField
                                label="New Criteria Value"
                                value={newCriteriaValue}
                                onChange={(e) => setNewCriteriaValue(e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                                error={!!percentError}
                                helperText={percentError}
                            />
                        )}
                        {orgID !== 1 && (
                            <TextField
                                label="New Point Value"
                                value={newPointValue}
                                onChange={(e) => setNewPointValue(e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                                error={!!pointError}
                                helperText={pointError}
                            />
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="contained" color="primary" onClick={handleSave}>
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