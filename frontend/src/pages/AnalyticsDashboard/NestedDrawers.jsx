import React, { useState } from 'react';
import {
    Drawer, Box, IconButton, Typography, TextField, List, ListItem, ListItemText,
    Tooltip as MuiTooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import MemberDetailsPage from '../MemberDetails/MemberDetailsPage';
import SnackbarAlert from '../../components/SnackbarAlert';

/**
 * NestedDrawers.jsx
 * 
 * This React component provides a nested drawer interface for displaying and managing member details.
 * It includes a primary drawer for listing members and a secondary drawer for viewing detailed information
 * about a selected member. The component supports search functionality, email copying, and attendance updates.
 * 
 * Key Features:
 * - Displays a list of members with search functionality.
 * - Provides a nested drawer for viewing and editing detailed member information.
 * - Allows users to copy member emails to the clipboard.
 * - Handles attendance updates for selected members.
 * - Displays event details when available, including title, date, type, and attendance count.
 * - Provides feedback using a SnackbarAlert component.
 * 
 * Props:
 * - open: Boolean indicating whether the primary drawer is open.
 * - detailsOpen: Boolean indicating whether the secondary drawer is open.
 * - membersList: Array of member objects to display in the list.
 * - selectedMemberID: ID of the currently selected member.
 * - organizationID: String representing the organization ID.
 * - selectedSemester: Object representing the currently selected semester.
 * - title: String representing the title of the primary drawer.
 * - searchTerm: String representing the current search term.
 * - onSearchChange: Function to handle changes to the search term.
 * - onClose: Function to close the primary drawer.
 * - onDetailsClose: Function to close the secondary drawer.
 * - onItemSelect: Function to handle member selection.
 * - onAttendanceUpdate: Function to handle attendance updates.
 * - eventDetails: Object containing details about the event (optional).
 * 
 * Dependencies:
 * - React, Material-UI components, and icons.
 * - MemberDetailsPage: A component for displaying detailed member information.
 * - SnackbarAlert: A custom component for displaying alerts.
 * 
 * Functions:
 * - handleCopyEmails: Copies the emails of filtered members to the clipboard.
 * - filteredMembers: Filters the member list based on the search term.
 * 
 * Hooks:
 * - React.useState: Manages state for Snackbar visibility and messages.
 * 
 * @component
 */
const NestedDrawers = ({
    open, detailsOpen, membersList = [], selectedMemberID,
    organizationID, selectedSemester, title,
    searchTerm, onSearchChange, onClose, onDetailsClose,
    onItemSelect, onAttendanceUpdate, eventDetails = null,
}) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const filteredMembers = Array.isArray(membersList) ? membersList.filter(member => {
        const fullName = `${member.FirstName} ${member.LastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
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