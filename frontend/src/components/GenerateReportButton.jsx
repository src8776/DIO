import * as React from 'react';
import Button from '@mui/material/Button';
import EditNoteIcon from '@mui/icons-material/EditNote';

// TODO: add report generation functionality

export default function GenerateReport() {
  return (
    <Button
      component="label"
      color="gray"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<EditNoteIcon />}
    >
      Generate Report
 
    </Button>
  );
}
