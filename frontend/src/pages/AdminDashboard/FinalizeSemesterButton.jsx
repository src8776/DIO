import * as React from 'react';
import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SnackbarAlert from '../../components/SnackbarAlert';

export default function FinalizeSemesterButton({ orgID, selectedSemester, buttonProps = {} }) {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const showAlert = (message, severity) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setOpenSnackbar(true);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        setLoading(true);
        const finalizeCommand = {
            orgID: orgID,
            selectedSemester: selectedSemester,
        }

        fetch(`/api/finalizeSemester`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalizeCommand),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert(`Successfully finalized semester`, 'success');
                } else {
                    showAlert(`Failed to finalize semester due to ${data.error}`, 'error');
                }
            })
            .catch(() => {
                showAlert('Unrecoverable error occurred. Please contact administrator!', 'error');
            })
            .finally(() => {
                setLoading(false);
                setOpen(false);
            });
    };

    return (
        <>
            <Button
                color="error"
                onClick={handleClickOpen}
                disabled={!selectedSemester}
                startIcon={<CheckIcon />}
                {...buttonProps}
            >
                Finalize Semester
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Finalize Semester</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Finalizing this semester will re-evaluate the status of all current members and propagate their data into the next semester where appropriate.
                        <br />
                        <ul>
                            <li>
                                ensure all attendance data has been entered
                            </li>
                            <li>
                                ensure all members going on COOP have been marked as 'Exempt'
                            </li>
                        </ul>
                        You will no longer be able to modify the event rules and point values for this semester after finalization.
                        <br />
                        <br />
                        This action cannot be undone: Finalize Semester?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined'>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        variant='contained'
                        sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#388E3C' } }}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? 'Processing...' : 'Finalize'}
                    </Button>
                </DialogActions>
            </Dialog>
            <SnackbarAlert
                open={openSnackbar}
                message={alertMessage}
                severity={alertSeverity}
                onClose={() => setOpenSnackbar(false)}
            />
        </>
    );
}