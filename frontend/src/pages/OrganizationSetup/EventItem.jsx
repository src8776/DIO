import * as React from 'react';
import { Box, ListItemButton, ListItemText, Modal } from '@mui/material';
import EventItemRules from './EventItemRules';

/**
 * EventItem.jsx
 * 
 * This React component renders a list item representing an event type and its associated rules.
 * It displays the event name and the number of rules associated with it. When clicked, it opens
 * a modal containing the `EventItemRules` component for managing the event's rules and settings.
 * 
 * Key Features:
 * - Displays the event name and the count of associated rules.
 * - Opens a modal to show and manage the event's rules and settings.
 * - Passes relevant props to the `EventItemRules` component for detailed rule management.
 * 
 * Props:
 * - name: String representing the name of the event type.
 * - rules: Array of rule objects associated with the event type.
 * - ruleType: String representing the type of rules (e.g., "Attendance" or "Hours").
 * - requirementType: String representing the requirement type for the event.
 * - maxPoints: Number representing the maximum points for the event.
 * - orgID: String or number representing the organization ID.
 * - occurrenceTotal: Number representing the total occurrences of the event per semester.
 * - eventTypeID: String or number representing the event type ID.
 * - semesterID: String or number representing the semester ID.
 * - isEditable: Boolean indicating whether the event rules can be edited.
 * - open: Boolean indicating whether the modal is open.
 * - onOpen: Function to handle opening the modal.
 * - onClose: Function to handle closing the modal.
 * 
 * Dependencies:
 * - React, Material-UI components.
 * - EventItemRules: A custom component for managing the event's rules and settings.
 * 
 * @component
 */
export default function EventItem({
    name, rules, ruleType, requirementType,
    maxPoints, orgID, occurrenceTotal,
    eventTypeID, semesterID,
    isEditable, open, onOpen, onClose
}) {
    return (
        <>
            <ListItemButton onClick={onOpen}>
                <ListItemText primary={name} secondary={rules.length + ` rule${rules.length !== 1 ? 's' : ''}`} />
            </ListItemButton>
            <Modal open={open} onClose={onClose}>
                <Box>
                    <EventItemRules
                        name={name}
                        rules={rules}
                        ruleType={ruleType}
                        requirementType={requirementType}
                        maxPoints={maxPoints}
                        orgID={orgID}
                        occurrenceTotal={occurrenceTotal}
                        eventTypeID={eventTypeID}
                        semesterID={semesterID}
                        isEditable={isEditable}
                    />
                </Box>
            </Modal>
        </>
    );
}