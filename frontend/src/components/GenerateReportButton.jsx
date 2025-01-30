import React from 'react';
import { Box, Button, Modal } from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import GenerateReportPage from '../pages/GenerateReport/GenerateReportPage';

export default function GenerateReport() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [filters, setFilters] = React.useState({
    activeOnly: false,
    dateRangeStart: null,
    dateRangeEnd: null,
  });

  const handleFilterChange = (event) => {
    const { name, checked, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: event.target.type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (name, newValue) => {
    setFilters((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleGenerateReport = () => {
    console.log("Generating report with filters:", filters);
    // TODO: Implement report generation logic
    //       if start date is null, set to first day of semester
    //       if end date is null, set to today
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        startIcon={<EditNoteIcon />}
      >
        Generate Report

      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box>
          <GenerateReportPage
            filters={filters}
            handleClose={handleClose}
            handleFilterChange={handleFilterChange}
            handleGenerateReport={handleGenerateReport}
            handleDateChange={handleDateChange}
          />
        </Box>
      </Modal>
    </>
  );
}
