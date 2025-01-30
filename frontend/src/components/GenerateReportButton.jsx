import * as React from 'react';
import { Box, Button, Typography, Modal, FormGroup, FormControlLabel, Checkbox, TextField } from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import GenerateReportPage from '../pages/GenerateReport/GenerateReportPage';

export default function GenerateReport() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [filters, setFilters] = React.useState({
    activeOnly: false,
    dateRangeStart: "",
    dateRangeEnd: "",
  });
  
  const handleFilterChange = (event) => {
    const { name, checked, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: event.target.type === "checkbox" ? checked : value,
    }));
  };

  const handleGenerateReport = () => {
    console.log("Generating report with filters:", filters);
    // TODO: Implement report generation logic
    handleClose();
  };

  return (
    <>
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
    <Modal open={open} onClose={handleClose}>
      <Box >
        <GenerateReportPage />
      </Box>
    </Modal>
  </>
  );
}
