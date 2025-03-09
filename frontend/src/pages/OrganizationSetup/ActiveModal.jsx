import * as React from 'react';
import {
    Box, Button, Container,
    FormControl, IconButton,
    InputLabel, MenuItem, Paper,
    Select, Table, TableBody, TableCell,
    TableHead, TextField, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const modalStyle = {
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


export default function ActiveModal({ orgID, semesterID, numberOfRules, isEditable }) {
    const [open, setOpen] = React.useState(false);
    const [activeRequirement, setActiveRequirement] = React.useState(null);
    const [newActiveRequirement, setNewActiveRequirement] = React.useState('');
    const [requirementType, setRequirementType] = React.useState('');
    const [newRequirementType, setNewRequirementType] = React.useState('');
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    // fetch current requirement info
    React.useEffect(() => {
        if (orgID && semesterID) {
            fetch(`/api/organizationInfo/activeRequirement?organizationID=${orgID}&semesterID=${semesterID}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        setActiveRequirement(data[0].ActiveRequirement);
                        setRequirementType(data[0].Description);
                    }
                })
                .catch(error => console.error('Error fetching active requirement:', error));
        }
    }, [orgID, semesterID]);

    const handleOpen = () => {
        setNewActiveRequirement(activeRequirement);
        setNewRequirementType(requirementType);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSave = () => {
        if (requirementType == 'criteria' & newActiveRequirement > numberOfRules) {
            setError(true);
            setHelperText(`Value cannot be greater than ${numberOfRules}`);
            return;
        }

        if (newActiveRequirement <= 0) {
            setError(true);
            setHelperText(`Value must be at least 1`);
            return;
        }

        fetch('/api/organizationInfo/updateActiveRequirement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organizationID: orgID,
                semesterID,
                activeRequirement: newActiveRequirement,
                requirementType: newRequirementType
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setActiveRequirement(newActiveRequirement);
                    setRequirementType(newRequirementType);
                    handleClose();
                }
            })
            .catch(error => console.error('Error updating active requirement:', error));
    };

    return (
        <Container >
            <Paper elevation={1} sx={modalStyle}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="h5">
                        'Active' status requirements
                    </Typography>
                    {isEditable && (
                        <IconButton onClick={handleOpen} sx={{ color: '#015aa2' }}>
                            <EditIcon />
                        </IconButton>
                    )}
                </Box>
                {/* Form Elements */}
                <Box component={"form"} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                    <Table>
                        <TableHead>
                            <TableCell><strong>Rule</strong></TableCell>
                            <TableCell><strong>{requirementType == 'criteria' ? 'Criteria' : 'Points'}</strong></TableCell>
                        </TableHead>
                        <TableBody>
                            <TableCell>To achieve active status:</TableCell>
                            <TableCell>
                                {activeRequirement ? (
                                    requirementType == 'criteria' ? (
                                        activeRequirement == numberOfRules ? 'Meet all criteria' : `Meet at least ${activeRequirement} criteria`
                                    ) : (
                                        `earn ${activeRequirement} points.`
                                    )
                                ) : (
                                    'no rule defined'
                                )}
                            </TableCell>
                        </TableBody>
                    </Table>
                </Box>

                {/* Edit Options */}
                {open && isEditable && (
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Updating {requirementType == 'criteria' ? 'Criteria' : 'Points'} Requirement
                        </Typography>

                        <FormControl>
                            <InputLabel id="requiremen-type-select-label">Requirement Type</InputLabel>
                            <Select
                                labelID="requiremen-type-select-label"
                                label="Requirement Type"
                                value={newRequirementType}
                                onChange={(e) => setNewRequirementType(e.target.value)}
                                sx={{ width: '150px', mb: 2 }}
                            >
                                <MenuItem value="points">Points</MenuItem>
                                <MenuItem value="criteria">Criteria</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Active Requirement"
                            value={newActiveRequirement}
                            onChange={(e) => setNewActiveRequirement(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            error={error}
                            helperText={helperText}
                        />
                        <Typography>
                            Example:
                            {newRequirementType == 'criteria' ? (
                                <> "complete all requirements to become active"</>
                            ) : (
                                <> "earn at least 18 points to become active"</>
                            )}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
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
    )
};