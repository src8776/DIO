import * as React from 'react';
import { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box, Button, Typography,
  IconButton, TextField, Dialog,
  DialogTitle, DialogContent,
  DialogContentText, DialogActions
} from '@mui/material';
import { shouldForwardProp } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import SnackbarAlert from '../../components/SnackbarAlert';



const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragging' && prop !== 'hasFile',
})(({ isDragging, hasFile }) => ({
  border: `2px dashed ${isDragging ? '#1976d2' : '#ccc'}`,
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  backgroundColor: isDragging ? '#e3f2fd' : 'background.paper',
  transition: 'all 0.3s ease',
  '&:hover': hasFile ? {} : {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
}));

/**
 * FileUploadButton.jsx
 * 
 * This React component provides functionality for uploading CSV files with drag-and-drop and browse options.
 * It allows users to upload files, validate them, and handle missing data scenarios through dialogs.
 * The component supports dynamic feedback with alerts and loading states.
 * 
 * Key Features:
 * - Drag-and-drop area for uploading CSV files.
 * - File validation for type, size, and format.
 * - Optional event title input for uploaded files.
 * - Handles missing data scenarios with dialogs for user confirmation.
 * - Displays success or error messages using a SnackbarAlert component.
 * 
 * Props:
 * - orgID: String representing the organization ID.
 * - eventType: String representing the type of event.
 * - onUploadSuccess: Callback function triggered after a successful file upload.
 * - selectedSemester: Object containing details about the selected semester (e.g., start date, end date, term name).
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * - SnackbarAlert: A custom component for displaying alerts.
 * 
 * Functions:
 * - validateFile: Validates the selected file for type, size, and format.
 * - handleFileChange: Handles file selection from the file input.
 * - handleDragOver, handleDragLeave, handleDrop: Manage drag-and-drop events.
 * - uploadFile: Uploads the file to the backend with additional parameters.
 * - handleUpload: Handles the initial upload attempt and manages backend responses.
 * - showAlert: Displays alerts with a message and severity.
 * 
 * Hooks:
 * - React.useState: Manages state for file, loading, alerts, dialogs, and drag-and-drop interactions.
 * - React.useRef: References the file input element for resetting its value.
 * 
 * @component
 */
export default function InputFileUpload({ orgID, eventType, onUploadSuccess, selectedSemester }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSingleDateDialog, setOpenSingleDateDialog] = useState(false);
  const [openMultipleDatesDialog, setOpenMultipleDatesDialog] = useState(false);
  const [dialogData, setDialogData] = useState({});
  const fileInputRef = useRef(null);

  // Show alert with message and severity
  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setOpenSnackbar(true);
  };

  // Validate selected file
  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      showAlert('You must select a file', 'error');
      return false;
    }
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      showAlert('Invalid file type. Only CSV files are allowed.', 'error');
      return false;
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      showAlert('File size exceeds maximum 2MB', 'error');
      return false;
    }
    return true;
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag-and-drop events
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  // Upload file with specified user choice
  const uploadFile = (choice) => {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('eventType', eventType);
    formData.append('orgID', orgID);
    formData.append('eventTitle', eventTitle);
    if (choice === 'assignDate') formData.append('assignDate', 'true');
    if (choice === 'skipMissing') formData.append('skipMissing', 'true');
    if (selectedSemester) {
      formData.append('semesterStart', selectedSemester.StartDate);
      formData.append('semesterEnd', selectedSemester.EndDate);
      formData.append('semesterName', selectedSemester.TermName);
    }

    setIsUploading(true);
    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showAlert(`Successfully uploaded file: ${file.name}`, 'success');
          onUploadSuccess?.();
          setFile(null);
        } else {
          showAlert(`Failed to upload file: ${file.name} due to ${data.error}`, 'error');
        }
      })
      .catch(() => {
        showAlert('Unrecoverable error occurred. Please contact administrator!', 'error');
      })
      .finally(() => {
        setIsUploading(false);
        setOpenSingleDateDialog(false);
        setOpenMultipleDatesDialog(false);
      });
  };

  // Handle initial upload attempt
  const handleUpload = () => {
    if (!file || !eventType) {
      showAlert(!file ? 'No file selected' : 'No event type selected', 'error');
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('eventType', eventType);
    formData.append('orgID', orgID);
    formData.append('eventTitle', eventTitle);
    if (selectedSemester) {
      formData.append('semesterStart', selectedSemester.StartDate);
      formData.append('semesterEnd', selectedSemester.EndDate);
      formData.append('semesterName', selectedSemester.TermName);
    }

    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'single_date_missing') {
          setDialogData({ missingCount: data.missingCount, eventDate: data.eventDate });
          setOpenSingleDateDialog(true);
        } else if (data.status === 'multiple_dates_missing') {
          setDialogData({ missingCount: data.missingCount });
          setOpenMultipleDatesDialog(true);
        } else if (data.success) {
          showAlert(`Successfully uploaded file: ${file.name}`, 'success');
          onUploadSuccess?.();
          setFile(null);
        } else {
          showAlert(`Failed to upload file: ${file.name} due to ${data.error}`, 'error');
        }
      })
      .catch(() => {
        showAlert('Unrecoverable error occurred. Please contact administrator!', 'error');
      })
      .finally(() => setIsUploading(false));
  };

  return (
    <>
      <DropZone
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        isDragging={isDragging}
        hasFile={!!file}
        sx={{ opacity: isUploading ? 0.5 : 1, pointerEvents: isUploading ? 'none' : 'auto' }}
      >
        {isUploading ? (
          <Typography variant="body1">Uploading...</Typography>
        ) : file ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">
                Selected: <span style={{ color: 'rgb(0, 119, 255)' }}>{file.name}</span>
              </Typography>
              <IconButton
                size="small"
                onClick={() => setFile(null)}
                sx={{ color: 'red', '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.1)' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="Event Title (optional)"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleUpload} sx={{ mt: 2 }}>
              Upload
            </Button>
          </Box>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 40, color: isDragging ? '#1976d2' : '#888' }} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {isDragging ? 'Drop your CSV file here!' : 'Drag & drop your CSV file here'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>or</Typography>
            <Button
              component="label"
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 2 }}
            >
              Browse Files
              <VisuallyHiddenInput
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </Button>
          </>
        )}
      </DropZone>
      <Dialog open={openSingleDateDialog} onClose={() => setOpenSingleDateDialog(false)}>
        <DialogTitle>Confirm Date Assignment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            There are {dialogData.missingCount} rows with missing dates.<br/>
            Process the whole file as {dialogData.eventDate}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => uploadFile('assignDate')}>Yes</Button>
          <Button onClick={() => setOpenSingleDateDialog(false)}>No</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openMultipleDatesDialog} onClose={() => setOpenMultipleDatesDialog(false)}>
        <DialogTitle>Handle Missing Dates</DialogTitle>
        <DialogContent>
          <DialogContentText>
            There are {dialogData.missingCount} rows with missing dates. Skip rows or cancel upload.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => uploadFile('skipMissing')}>Skip Missing Rows</Button>
          <Button onClick={() => setOpenMultipleDatesDialog(false)}>Cancel Upload</Button>
        </DialogActions>
      </Dialog>
      <SnackbarAlert
        open={openSnackbar}
        message={alertMessage}
        severity={alertSeverity}
        onClose={() => setOpenSnackbar(false)}
      />
    </>
  );
}
