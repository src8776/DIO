import * as React from 'react';
import { Box, Button, Modal } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImportDataPage from '../ImportData/ImportDataPage';

export default function UploadAttendanceModal({ onUploadSuccess, selectedSemester }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Check if button should be disabled when no semester is selected
  const isSemesterSelected = selectedSemester !== null;

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        startIcon={<CloudUploadIcon />}
        sx={{ maxWidth: '280px' }}
        disabled={!isSemesterSelected} // Disable button if no semester selected
        title={isSemesterSelected ? "Upload attendance data" : "Please select a semester first"}
      >
        Upload Attendance Data
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box>
          {selectedSemester && (
            <ImportDataPage
              onUploadSuccess={onUploadSuccess}
              onClose={handleClose}
              semesterID={selectedSemester.SemesterID}
            />
          )}
        </Box>
      </Modal>
    </>
  );
}
