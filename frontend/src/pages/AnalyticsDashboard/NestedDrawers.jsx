import React, { useState } from 'react';
import {
    Drawer, Box, IconButton, Typography, TextField, List, ListItem, ListItemText,
    Tooltip as MuiTooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import MemberDetailsPage from '../MemberDetails/MemberDetailsPage';
import SnackbarAlert from '../../components/SnackbarAlert';

const NestedDrawers = ({
    open,
    detailsOpen,
    membersList = [],
    selectedMemberID,
    organizationID,
    selectedSemester,
    title,
    searchTerm,
    onSearchChange,
    onClose,
    onDetailsClose,
    onItemSelect,
    onAttendanceUpdate,
    eventDetails = null,
}) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const filteredMembers = Array.isArray(membersList) ? membersList.filter(member => {
        const fullName = `${member.FirstName} ${member.LastName}`.toLowerCase();
        return fullName.includes(memberSearch.toLowerCase());
    }) : [];

    const handleCopyEmails = () => {
        const emails = filteredMembers
            .filter((member) => member.Email && member.Email.trim() !== '')
            .map((member) => member.Email);
        if (emails.length === 0) {
            setSnackbarMessage('No emails to copy');
            setSnackbarOpen(true);
            return;
        }
        const emailString = emails.join(', ');
        navigator.clipboard.writeText(emailString)
            .then(() => {
                setSnackbarMessage(`${emails.length} email${emails.length === 1 ? '' : 's'} copied to your clipboard`);
                setSnackbarOpen(true);
            })
            .catch((err) => {
                console.error('Failed to copy emails:', err);
                setSnackbarMessage('Failed to copy emails');
                setSnackbarOpen(true);
            });
    };

    return (
        <>
            {/* Members List Drawer */}
            <Drawer
                anchor="left"
                open={open}
                onClose={onClose}
                sx={{
                    zIndex: 1200,
                    '& .MuiDrawer-paper': {
                        width: { xs: 300, sm: 400 },
                        left: 0,
                    },
                }}
            >
                <Box
                    sx={{
                        width: { xs: 300, sm: 400 },
                        p: 2,
                        bgcolor: 'background.paper',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: '1px solid #ccc',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', mb: 2 }}>
                        {eventDetails ? (
                            <>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {eventDetails.EventTitle}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {new Date(eventDetails.EventDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Type: {eventDetails.EventType}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Attendance: {eventDetails.attendanceCount}
                                </Typography>
                                <MuiTooltip title="Copy emails to clipboard">
                                    <IconButton
                                        sx={{ alignSelf: 'flex-start' }}
                                        onClick={handleCopyEmails}
                                        disabled={filteredMembers.length === 0}
                                        color="primary"
                                    >
                                        <ContactMailIcon />
                                    </IconButton>
                                </MuiTooltip>
                            </>
                        ) : (
                            <>
                                <Typography variant="h6" fontWeight="bold">
                                    {title}: {filteredMembers.length}
                                </Typography>
                                <MuiTooltip title="Copy emails to clipboard">
                                    <IconButton
                                        sx={{ alignSelf: 'flex-start' }}
                                        onClick={handleCopyEmails}
                                        disabled={filteredMembers.length === 0}
                                        color="primary"
                                    >
                                        <ContactMailIcon />
                                    </IconButton>
                                </MuiTooltip>
                            </>
                        )}
                    </Box>
                    <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Search attendees..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                        {filteredMembers.length > 0 ? (
                            <List dense>
                                {filteredMembers.map((member) => (
                                    <ListItem
                                        key={member.MemberID}
                                        button
                                        onClick={() => onItemSelect(member.MemberID)}
                                        divider
                                        sx={{ py: 1, cursor: 'pointer' }}
                                    >
                                        <ListItemText primary={`${member.FirstName} ${member.LastName}`} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No attendees found
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Drawer>
            <Drawer
                anchor="left"
                open={detailsOpen}
                onClose={onDetailsClose}
                variant="persistent"
                sx={{
                    zIndex: 1300,
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 500, md: 700 },
                        '@media (min-width:1102px)': {
                            left: 400,
                        },
                    },
                }}
            >
                <Box sx={{ width: { xs: '100%', sm: 500, md: 700 }, height: '100%', overflowY: 'auto' }}>
                    {selectedMemberID && (
                        <MemberDetailsPage
                            memberID={selectedMemberID}
                            orgID={organizationID}
                            selectedSemester={selectedSemester}
                            onClose={onDetailsClose}
                            onAttendanceUpdate={onAttendanceUpdate}
                        />
                    )}
                </Box>
            </Drawer>
            <SnackbarAlert
                message={snackbarMessage}
                severity={snackbarMessage.includes('No emails') || snackbarMessage.includes('Failed') ? 'error' : 'success'}
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
            />
        </>
    );
};

export default NestedDrawers;