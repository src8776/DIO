import * as React from 'react';
import { Box, ListItemButton, ListItemText, Modal } from '@mui/material';
import RuleModal from './RuleModal_old';




export default function RuleListItem({ name, rules }) {
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
                    <RuleModal name={name} rules={rules} />
                </Box>
            </Modal>
        </>
    )
};