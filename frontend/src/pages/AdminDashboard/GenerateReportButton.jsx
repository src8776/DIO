import React from 'react';
import dayjs from 'dayjs';
import { Box, Button, Modal } from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import GenerateReportPage from '../GenerateReport/GenerateReportPage';

export default function GenerateReport({ orgID, selectedSemester, buttonProps = {} }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [filters, setFilters] = React.useState({
    memberStatus: 'both', // Default to 'both'
    includeClothingSize: false,
    includeGraduationYear: false,
    includeMajor: false,
    includeAcademicYear: false,
    includePhoneNumber: false,
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

    const reportCommand = {
      orgID: orgID,
      selectedSemester: selectedSemester,
      filters: filters,
    }

    fetch(`/api/admin/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      },
      body: JSON.stringify(reportCommand),
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "report-" + dayjs().format("YYYY-MM-DD HH.mm.ss") + ".pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.log(error);
        showAlert('Unrecoverable error occured when generating report. Please contact administrator!', 'error');
      });

    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        startIcon={<EditNoteIcon />}
        {...buttonProps}
      >
        Quick Report

      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box>
          <GenerateReportPage
            filters={filters}
            handleClose={handleClose}
            handleFilterChange={handleFilterChange}
            handleGenerateReport={handleGenerateReport}
          />
        </Box>
      </Modal>
    </>
  );
}
