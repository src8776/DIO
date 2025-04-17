import React from 'react';
import dayjs from 'dayjs';
import { Box, Button, Modal } from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import GenerateReportPage from '../GenerateReport/GenerateReportPage';

/**
 * GenerateReportButton.jsx
 * 
 * This React component provides a button and modal interface for generating reports.
 * It allows administrators to customize report filters and generate a PDF report for the selected semester.
 * The component handles user input for filters, sends a request to the backend, and downloads the generated report.
 * 
 * Key Features:
 * - Opens a modal to display the GenerateReportPage component for filter customization.
 * - Allows administrators to include or exclude specific fields in the report (e.g., clothing size, major).
 * - Sends a request to the backend to generate a PDF report based on the selected filters.
 * - Downloads the generated report as a PDF file.
 * - Provides error handling and feedback for failed report generation.
 * 
 * Props:
 * - orgID: String representing the organization ID.
 * - selectedSemester: Object representing the currently selected semester.
 * - buttonProps: Object containing additional props for the "Quick Report" button (optional).
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * - GenerateReportPage: A child component for rendering the filter customization form.
 * - dayjs: A library for formatting dates.
 * 
 * Functions:
 * - handleOpen: Opens the modal.
 * - handleClose: Closes the modal.
 * - handleFilterChange: Updates the report filters based on user input.
 * - handleGenerateReport: Sends a request to the backend to generate the report and downloads the PDF file.
 * 
 * Hooks:
 * - React.useState: Manages state for modal visibility and report filters.
 * 
 * @component
 */
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
