import * as React from 'react';
import { Box, Button, Modal } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImportDataPage from '../ImportData/ImportDataPage';

export default function AddMemberModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        startIcon={<CloudUploadIcon />}
      >
        Upload Attendance Data
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box>
          <ImportDataPage/>
        </Box>
      </Modal>
    </>
  );
}
