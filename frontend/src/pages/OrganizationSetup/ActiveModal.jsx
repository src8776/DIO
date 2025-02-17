import * as React from 'react';
import { Box, Button, Container, IconButton, Modal, Paper, Table, TableBody, TableCell, TableHead, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

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


export default function ActiveModal({ orgID, numberOfRules }) {
    const [activeRequirement, setActiveRequirement] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [newActiveRequirement, setNewActiveRequirement] = React.useState('');
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    React.useEffect(() => {
        fetch(`/api/organizationInfo/activeRequirement?organizationID=${orgID}`)
            .then((response) => response.json())
            .then((data) => {
                // console.log('Fetched data:', data);
                if (data.length > 0) {
                    setActiveRequirement(data[0].ActiveRequirement); // Extract Name directly
                } else {
                    setActiveRequirement(null); // Set to null if no data
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setActiveRequirement(null); // Set to null on error
            });
    }, [orgID]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSave = () => {
        if (newActiveRequirement > numberOfRules) {
            setError(true);
            setHelperText(`Value cannot be greater than ${numberOfRules}`);
            return;
        }

        fetch('/api/organizationInfo/updateActiveRequirement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organizationID: orgID,
                activeRequirement: newActiveRequirement,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setActiveRequirement(newActiveRequirement);
                    handleClose();
                } else {
                    console.error('Error updating active requirement:', data.error);
                }
            })
            .catch((error) => {
                console.error('Error updating active requirement:', error);
            });
    };

    return (
        <Container >
            <Paper elevation={1} sx={style}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="h5">
                        "Active" status requirements
                    </Typography>
                    <IconButton onClick={handleOpen} sx={{ color: '#015aa2' }}>
                        <EditIcon/>
                    </IconButton>
                </Box>
                {/* Form Elements */}
                <Box component={"form"} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%'}}>
                    <Table>
                        <TableHead>
                            <TableCell><strong>Rule</strong></TableCell>
                            <TableCell><strong>{orgID == 1 ? 'Criteria' : 'Points'}</strong></TableCell>
                        </TableHead>
                        <TableBody>
                            <TableCell>To Achieve 'active' status:</TableCell>
                            <TableCell>
                                {activeRequirement ? (
                                    orgID == 1 ? (
                                        activeRequirement == numberOfRules ? 'Meet all criteria' : `Meet at least ${activeRequirement} criteria`
                                    ) : (
                                        `earn ${activeRequirement} points`
                                    )
                                ) : (
                                    'no rule defined'
                                )}
                            </TableCell>                        </TableBody>
                    </Table>
                </Box>

                {open && (
                    <Box sx={{  width: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Update {orgID == 1 ? 'Criteria' : 'Points'} Rule
                        </Typography>
                        <TextField
                            label="New Active Requirement"
                            value={newActiveRequirement}
                            onChange={(e) => setNewActiveRequirement(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            error={error}
                            helperText={helperText}
                        />
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

    )
};