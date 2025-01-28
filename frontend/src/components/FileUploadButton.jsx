import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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

export default function InputFileUpload() {
  const [file, setFile] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    handleUpload(selectedFile);
    // Uncomment the next line to allow uploading the same file twice
    // event.target.value = '';
  };

  const handleUpload = (file) => {
    if (file) {
      const formData = new FormData();
      formData.append('csv_file', file);
      fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setAlertMessage('Successfully uploaded file: ' + data.file.originalname);
        setAlertSeverity('success');
        setOpenSnackbar(true);
      })
      .catch(error => {
        console.log(error);
        setAlertMessage('Failed to upload file: ' + error.file.originalname);
        setAlertSeverity('error');
        setOpenSnackbar(true);
      });
    } else {
        setAlertMessage('You must select a file');
        setAlertSeverity('error');
        setOpenSnackbar(true);
    }
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
        Import Attendance Data
        <VisuallyHiddenInput
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={alertSeverity} variant="filled" >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
 