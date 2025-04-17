import * as React from 'react';
import { Drawer, Box, IconButton,  } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import MemberDetailsPage from './MemberDetailsPage';

/**
 * MemberDetailsDrawer.jsx
 * 
 * This React component renders a drawer interface for displaying detailed information about a specific member.
 * It provides a button to open the drawer and displays the `MemberDetailsPage` component inside the drawer.
 * The drawer can be opened and closed dynamically, and it supports passing member-specific data for detailed viewing.
 * 
 * Key Features:
 * - Displays a button with an info icon to open the member details drawer.
 * - Renders the `MemberDetailsPage` component inside the drawer for detailed member information.
 * - Supports dynamic updates based on the provided member data and interactions.
 * - Handles drawer open and close events with smooth transitions.
 * 
 * Props:
 * - memberID: String representing the ID of the member.
 * - orgID: String or number representing the organization ID.
 * - memberStatus: String representing the current status of the member.
 * - selectedSemester: Object representing the currently selected semester.
 * - onMemberUpdate: Function to handle updates to the member's details.
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * - MemberDetailsPage: A custom component for displaying detailed member information.
 * 
 * Functions:
 * - handleOpen: Opens the drawer when the info button is clicked.
 * - handleClose: Closes the drawer when the close button or outside area is clicked.
 * 
 * Hooks:
 * - React.useState: Manages the open state of the drawer.
 * 
 * @component
 */
export default function MemberDetailsDrawer({ memberID, orgID, memberStatus, selectedSemester, onMemberUpdate }) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = (event) => {
    event.stopPropagation();
    setOpen(true);
  };

  const handleClose = (event) => {
    event.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="member details"
        size="large"
      >
        <InfoIcon fontSize="inherit" />
      </IconButton>
      <Drawer onClick={(e) => e.stopPropagation()} anchor="left" open={open} onClose={handleClose} sx={{ overflowY: 'scroll' }} PaperProps={{
        sx: { width: { xs: '100%', sm: 500, md: 700 }, overflowY: 'scroll' }
      }}>
        <Box sx={{ p: { xs: 0, md: 0 } }}>
          
          <MemberDetailsPage
            memberID={memberID}
            orgID={orgID}
            memberStatus={memberStatus}
            selectedSemester={selectedSemester}
            onMemberUpdate={onMemberUpdate}
            onClose={handleClose}
          />
        </Box>
      </Drawer>
    </>
  );
}