import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

// TODO: Create form to add new member to database
//       this button should open said form >:)

export default function InputFileUpload() {
  return (
    <Button
      component="label"
      color="gray"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<AddIcon />}
    >
      Add Member

    </Button>
  );
}
