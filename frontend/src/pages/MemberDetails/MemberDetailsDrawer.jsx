import * as React from 'react';
import { Drawer, Box, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import MemberDetailsPage from './MemberDetailsPage';

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
      <Drawer onClick={(e) => e.stopPropagation()} anchor="right" open={open} onClose={handleClose} sx={{ overflowY: 'scroll' }} PaperProps={{
        sx: { width: { xs: '100%', sm: 500, md: 700 }, overflowY: 'scroll' }
      }}>
        <Box sx={{ p: {xs: 0, md:2} }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <MemberDetailsPage
            memberID={memberID}
            orgID={orgID}
            memberStatus={memberStatus}
            selectedSemester={selectedSemester}
            onMemberUpdate={onMemberUpdate}
          />
        </Box>
      </Drawer>
    </>
  );
}