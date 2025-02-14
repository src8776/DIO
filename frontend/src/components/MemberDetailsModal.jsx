import * as React from 'react';
import { Box, IconButton, Modal } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MemberDetailsPage from '../pages/MemberDetails/MemberDetailsPage';

// TODO: Use memberID to get all the info on the specific member

const mockMemberData = {
  MemberID: 12345,
  UserName: "lse3284",
  FirstName: "Liam",
  LastName: "Edwards",
  Email: "lse3284@example.com",
  Major: "Computer Science",
  IsActive: true,
  GraduationYear: 2025,
  AcademicYear: "Senior",
  AttendanceHistory: [
    { date: "2025-01-20", event: "General Meeting" },
    { date: "2025-01-15", event: "Workshop" },
    { date: "2025-01-12", event: "General Meeting" },
    { date: "2025-01-10", event: "Volunteer" },
    { date: "2025-01-08", event: "Club Fair" },
    { date: "2025-01-06", event: "General Meeting" },
    { date: "2024-12-20", event: "Volunteer" },
    { date: "2024-12-15", event: "Holiday Celebration" },
    { date: "2024-12-10", event: "General Meeting" },
    { date: "2024-11-25", event: "Workshop" },
    { date: "2024-11-20", event: "Club Fair" },
    { date: "2024-11-15", event: "Volunteer" },
    { date: "2024-11-10", event: "General Meeting" },
    { date: "2024-10-30", event: "Halloween Social" },
    { date: "2024-10-25", event: "General Meeting" },
    { date: "2024-10-20", event: "Volunteer" },
    { date: "2024-10-15", event: "Club Fair" },
    { date: "2024-10-10", event: "Workshop" },
    { date: "2024-09-25", event: "General Meeting" },
    { date: "2024-09-20", event: "Volunteer" },
    { date: "2024-09-15", event: "Club Orientation" },
  ],
};


export default function IndividualDataModal({ memberID }) {


  const [open, setOpen] = React.useState(false);
  const handleOpen = (event) => {
    event.stopPropagation();
    setOpen(true);
  };
  const handleClose = (event) => {
    event.stopPropagation();
    setOpen(false)
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
      <Modal open={open} onClose={handleClose}>
        <Box >
          <MemberDetailsPage
            memberData={mockMemberData}
          />
        </Box>
      </Modal>
    </>
  );
}
