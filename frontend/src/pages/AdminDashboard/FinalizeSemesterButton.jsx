import * as React from 'react';
import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress } from '@mui/material';
import SnackbarAlert from '../../components/SnackbarAlert';

/**
 * FinalizeSemesterButton.jsx
 * 
 * This React component provides a button and dialog interface for finalizing a semester.
 * It allows administrators to confirm the finalization process, which re-evaluates member statuses,
 * propagates data into the next semester, and locks modifications for the finalized semester.
 * 
 * Key Features:
 * - Displays a confirmation dialog with detailed instructions and warnings.
 * - Sends a request to the backend to finalize the semester.
 * - Provides feedback on success or failure using a SnackbarAlert component.
 * - Includes a loading state to indicate processing during the finalization.
 * 
 * Props:
 * - orgID: String representing the organization ID.
 * - selectedSemester: Object representing the currently selected semester.
 * - buttonProps: Object containing additional props for the "Finalize Semester" button (optional).
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * - SnackbarAlert: A custom component for displaying alerts.
 * 
 * Functions:
 * - showAlert: Displays a SnackbarAlert with a message and severity.
 * - handleClickOpen: Opens the confirmation dialog.
 * - handleClose: Closes the confirmation dialog.
 * - handleConfirm: Sends a request to finalize the semester and handles the response.
 * 
 * Hooks:
 * - React.useState: Manages state for dialog visibility, loading, alert messages, and Snackbar visibility.
 * 
 * @component
 */
export default function FinalizeSemesterButton({ orgID, selectedSemester, open, onClose }) {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const showAlert = (message, severity) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setOpenSnackbar(true);
    };

    React.useEffect(() => {
        if (open) setDialogOpen(true);
    }, [open]);

    const handleClickOpen = () => {
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        onClose?.();
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
                setDialogOpen(false);
                onClose?.();
            });
    };

    return (
        <>
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