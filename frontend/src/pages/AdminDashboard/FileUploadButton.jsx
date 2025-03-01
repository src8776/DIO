import * as React from 'react';
import { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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

const DropZone = styled(Box)(({ isDragging }) => ({
  border: `2px dashed ${isDragging ? '#1976d2' : '#ccc'}`,
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  backgroundColor: isDragging ? '#e3f2fd' : '#fafafa',
  transition: 'all 0.3s ease',
  '&:hover': {
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

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) {
      showAlert('You must select a file', 'error');
      return false;
    }

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      showAlert('Invalid file type. Only CSV files are allowed.', 'error');
      setFile(null);
      return false;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      showAlert('File size exceeds maximum 2MB', 'error');
      setFile(null);
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (validateAndSetFile(selectedFile)) {
      handleUpload(selectedFile);
    }
    // Uncomment for same file upload
    // if (fileInputRef.current) {
    //   fileInputRef.current.value = '';
    // }
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
    if (validateAndSetFile(droppedFile)) {
      handleUpload(droppedFile);
    }
  };

  const handleUpload = (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('eventType', eventType);
    formData.append('orgID', orgID);

    fetch(`/api/upload`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (!data.success) {
          const msg = "Failed to upload file: " + data.file.originalname + " due to " + data.error;
          showAlert(msg, 'error');
        } else {
          showAlert('Successfully uploaded file: ' + data.file.originalname + '. You can upload another file or close the modal.', 'success'); 
          onUploadSuccess?.();
          setFile(null);
        }
      })
      .catch(error => {
        console.log(error);
        showAlert('Unrecoverable error occured when uploading file. Please contact administrator!', 'error');
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
        sx={{ opacity: isUploading ? 0.5 : 1, pointerEvents: isUploading ? 'none' : 'auto' }}
      >
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
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Browse Files'}
          <VisuallyHiddenInput
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </Button>
        {file && !isUploading && (
          <Typography variant="body2" sx={{ mt: 2, color: '#1976d2' }}>
            Selected: {file.name}
          </Typography>
        )}
      </DropZone>
      <SnackbarAlert
        open={openSnackbar}
        message={alertMessage}
        severity={alertSeverity}
        onClose={handleCloseSnackbar}
      />
    </>
  );
}
