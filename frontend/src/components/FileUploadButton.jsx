import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';

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

  const handleFileChange = (event) => {
    console.log(event.target.files);
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    handleUpload(selectedFile);
    // IF WANT TO UPLOAD THE SAME FILE IN SAME DIRECTORY TWICE, UNCOMMENT
    // event.target.value = '';
  };

  const handleUpload = (file) => {
    if (file) {
      const formData = new FormData();
      formData.append('csv_file', file);
      console.log("going to upload file");
      // TODO: figure out how to unhardcode this line below
      fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        console.log('File uploaded successfully', data);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
    } else {
      alert('Please select a file first.');
    }
  };

  return (
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
  );
}
