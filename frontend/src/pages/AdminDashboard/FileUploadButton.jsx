import * as React from 'react';
import { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Button, Typography, IconButton } from '@mui/material';
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

const DropZone = styled(Box)(({ isDragging, hasFile }) => ({
  border: `2px dashed ${isDragging ? '#1976d2' : '#ccc'}`,
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  backgroundColor: isDragging ? '#e3f2fd' : '#fafafa',
  transition: 'all 0.3s ease',
  '&:hover': hasFile ? {} : {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
}));

export default function InputFileUpload({ orgID, eventType, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const fileInputRef = useRef(null);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setOpenSnackbar(true);
  };

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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const handleUpload = () => {
    if (!file) {
      showAlert('No file selected', 'error');
      return;
    }
    if (!eventType) {
      showAlert('No event type selected', 'error');
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('eventType', eventType);
    formData.append('orgID', orgID);

    fetch(`/api/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          const msg = 'Failed to upload file: ' + data.file.originalname + ' due to ' + data.error;
          showAlert(msg, 'error');
        } else {
          showAlert(
            'Successfully uploaded file: ' + data.file.originalname,
            'success'
          );
          onUploadSuccess?.();
          setFile(null); // Reset after successful upload
        }
      })
      .catch((error) => {
        console.log(error);
        showAlert('Unrecoverable error occurred when uploading file. Please contact administrator!', 'error');
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
              <Typography variant="body1">Selected: <span style={{ color: 'rgb(0, 119, 255)' }}>{file.name}</span></Typography>
              <IconButton size="small" onClick={() => setFile(null)} sx={{
                '&:hover': {
                  color: 'red',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)'
                },
              }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              sx={{ mt: 2 }}
            >
              Upload
            </Button>
          </Box>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 40, color: isDragging ? '#1976d2' : '#888' }} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {isDragging ? 'Drop your CSV file here!' : 'Drag & drop your CSV file here'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
              or
            </Typography>
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
      <SnackbarAlert
        open={openSnackbar}
        message={alertMessage}
        severity={alertSeverity}
        onClose={handleCloseSnackbar}
        autoHideDuration={4000}
      />
    </>
  );
}
