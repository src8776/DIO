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
 * Component for uploading CSV files with drag-and-drop and browse functionality.
 * @param {Object} props - Component props.
 * @param {string} props.orgID - Organization ID.
 * @param {string} props.eventType - Event type.
 * @param {Function} [props.onUploadSuccess] - Callback on successful upload.
 * @returns {JSX.Element}
 */
export default function InputFileUpload({ orgID, eventType, onUploadSuccess }) {
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
            There are {dialogData.missingCount} rows with missing dates. Process the whole file as {dialogData.eventDate}?
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
        autoHideDuration={4000}
      />
    </>
  );
}
