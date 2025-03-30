import * as React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

export default function FinalizeSemesterButton({ selectedSemester }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        // TODO: Add your finalization logic here
        setOpen(false);
    };

    return (
        <>
            <Button
                variant="contained"
                color="error"
                onClick={handleClickOpen}
                disabled={!selectedSemester}
                startIcon={<CheckIcon />}
                sx={{
                    maxWidth: '280px',
                    backgroundColor: '#4CAF50',
                    '&:hover': {
                        backgroundColor: '#388E3C',
                    },
                }}
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
                        This action cannot be undone: Finalize Semester?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined'>Cancel</Button>
                    <Button onClick={handleConfirm} variant='contained' sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#388E3C' } }}>
                        Finalize
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}