import * as React from 'react';
import { Box, Modal } from '@mui/material';
import AddEventForm from './AddEventForm';


export default function AddEventModal({ open, onClose, orgID, refetchEventRules, setSuccessMessage, semesterID }) {

    return (
        <Modal open={open} onClose={onClose}>
            <Box>
                <AddEventForm
                    onClose={onClose}
                    orgID={orgID}
                    refetchEventRules={refetchEventRules}
                    setSuccessMessage={setSuccessMessage}
                    semesterID={semesterID}
                />
            </Box>
        </Modal>
    );
};