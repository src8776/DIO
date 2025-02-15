import * as React from 'react';
import { Box, ListItemButton, ListItemText, Modal } from '@mui/material';
import EventItemRules from './EventItemRules';




export default function RuleListItem({ name, rules, ruleType }) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <ListItemButton onClick={handleOpen}>
                <ListItemText primary={name} />
            </ListItemButton>
            <Modal open={open} onClose={handleClose}>
                <Box>
                    <EventItemRules name={name} rules={rules} ruleType={ruleType} />
                </Box>
            </Modal>
        </>
    )
};