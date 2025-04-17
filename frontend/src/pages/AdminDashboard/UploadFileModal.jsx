import * as React from 'react';
import { Box, Button, Modal } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImportDataPage from '../ImportData/ImportDataPage';

/**
 * UploadFileModal.jsx
 * 
 * This React component provides a button and modal interface for uploading attendance data.
 * It allows administrators to upload data files for a selected semester and handles the upload process
 * through the ImportDataPage component.
 * 
 * Key Features:
 * - Displays a button to open the upload modal.
 * - Disables the button if no semester is selected, with a tooltip explaining the reason.
 * - Opens a modal containing the ImportDataPage component for file upload and processing.
 * - Closes the modal upon successful upload or user cancellation.
 * 
 * Props:
 * - onUploadSuccess: Callback function triggered after a successful file upload.
 * - selectedSemester: Object representing the currently selected semester.
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * - ImportDataPage: A child component for handling the file upload process.
 * 
 * Functions:
 * - handleOpen: Opens the modal.
 * - handleClose: Closes the modal.
 * 
 * Hooks:
 * - React.useState: Manages state for modal visibility.
 * 
 * @component
 */
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
              selectedSemester={selectedSemester}
            />
          )}
        </Box>
      </Modal>
    </>
  );
}
