import * as React from 'react';
import { Box, ListItemButton, ListItemText, Modal } from '@mui/material';
import EventItemRules from './EventItemRules';


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