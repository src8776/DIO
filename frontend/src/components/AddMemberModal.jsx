import * as React from 'react';
import { Box, Button, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddMemberPage from '../pages/AddMember/AddMemberPage';

// TODO: Implement handleSave function to save member data to database 
// TODO: display success message
// TODO: display error message if member already exists
// OPTIONAL TODO: display member details modal if member already exists

export default function AddMemberModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [memberData, setMemberData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setMemberData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Adding new member with info:", memberData);
    // TODO: Implement backend call to save member data
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        startIcon={<AddIcon />}
        sx={{maxWidth: '280px'}}
      >
        Add Member
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box>
          <AddMemberPage
            memberData={memberData}
            handleChange={handleChange}
            handleSave={handleSave}
          />
        </Box>
      </Modal>
    </>
  );
}
