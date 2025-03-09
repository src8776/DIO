import * as React from 'react';
import { Box, ListItemButton, ListItemText, Modal } from '@mui/material';
import EventItemRules from './EventItemRules';


export default function EventItem({ name, rules, ruleType, maxPoints, orgID, occurrenceTotal, eventTypeID, semesterID, refetchEventRules, isEditable }) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <ListItemButton onClick={() => setOpen(true)}>
                <ListItemText primary={name} secondary={rules.length + ` rule${rules.length !== 1 ? 's' : ''}`} />
            </ListItemButton>
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box>
                    <EventItemRules
                        name={name}
                        rules={rules}
                        ruleType={ruleType}
                        maxPoints={maxPoints}
                        orgID={orgID}
                        occurrenceTotal={occurrenceTotal}
                        eventTypeID={eventTypeID}
                        semesterID={semesterID}
                        refetchEventRules={refetchEventRules}
                        isEditable={isEditable}
                    />
                </Box>
            </Modal>
        </>
    )
};