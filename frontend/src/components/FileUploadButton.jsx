import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// TODO: use selectedEventType to ensure data from files is assigned the correct event type

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API URL IS: " + API_BASE_URL);

export default function InputFileUpload({ orgID, eventType }) {
  const selectedEventType = eventType;
  const selectedOrgID = orgID;
  const [file, setFile] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      showAlert('You must select a file', 'error');
      return;
    }

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      showAlert("Invalid file type. Only CSV files are allowed.", 'error');
      setFile(null);
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      showAlert("File size exceeds maximum 2MB", 'error');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    handleUpload(selectedFile);
    // Uncomment the next line to allow uploading the same file twice
    // event.target.value = '';
  };

  const handleUpload = (file) => {

      const formData = new FormData();
      formData.append('csv_file', file);
      formData.append('eventType', selectedEventType);
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
          showAlert('Successfully uploaded file: ' + data.file.originalname, 'success');
        }
      })
      .catch(error => {
        console.log(error);
        showAlert('Unrecoverable error occured when uploading file. Please contact administrator!', 'error');
      });

  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Button
        component="label"
        color="gray"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        Import Attendance File
        <VisuallyHiddenInput
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={60000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={alertSeverity} variant="filled" >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
