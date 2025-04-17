import * as React from 'react';
import { Box, Modal } from '@mui/material';
import AddEventForm from './AddEventForm';

/**
 * AddEventModal.jsx
 * 
 * This React component renders a modal interface for adding a new event type to an organization.
 * It wraps the `AddEventForm` component inside a Material-UI `Modal` and provides the necessary props
 * for managing the form's functionality and submission.
 * 
 * Key Features:
 * - Displays a modal containing the `AddEventForm` for adding new event types.
 * - Passes required props such as organization ID, semester ID, and callback functions to the form.
 * - Handles the modal's open and close states.
 * 
 * Props:
 * - open: Boolean indicating whether the modal is open.
 * - onClose: Function to close the modal.
 * - orgID: String or number representing the organization ID.
 * - refetchEventRules: Function to refresh the event rules after a successful submission.
 * - setSuccessMessage: Function to display a success message upon successful submission.
 * - semesterID: String or number representing the semester ID.
 * 
 * Dependencies:
 * - React, Material-UI components.
 * - AddEventForm: A custom component for rendering the event creation form.
 * 
 * @component
 */
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