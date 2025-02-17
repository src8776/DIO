import * as React from 'react';
import {
    Container, Paper, Typography,
    Box, Table, TableHead,
    TableBody, TableRow, TableCell,
    IconButton
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

export default function EventItemRules({ name, rules, ruleType }) {
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Container>
            <Paper elevation={1} sx={style}>
                <Box sx={{ width: '100%',display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Typography variant="h5" gutterBottom>
                        {name}
                    </Typography>
                    <IconButton sx={{ color: '#08A045' }}>
                        <AddCircleOutlineIcon/>
                    </IconButton>
                </Box>
                <Paper component="form" sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Rule Description</strong></TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rules && rules.length > 0 ? (
                                rules.map((rule, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{generateRuleDescription(rule, ruleType)}</TableCell>
                                        <TableCell align='right'>
                                            <IconButton onClick={handleOpen} sx={{ color: '#015aa2' }}>
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
            </Paper>
        </Container>
    );
}