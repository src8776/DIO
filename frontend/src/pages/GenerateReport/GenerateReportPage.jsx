import React from 'react';
import {
  Box, Button, Typography,
  FormGroup, FormControlLabel,
  Checkbox, Paper, Container,
  Divider, Radio, RadioGroup
} from "@mui/material";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'left',
  gap: 2,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  width: { xs: '90%', sm: '500px', md: '600px' },
  maxWidth: '100%',
};

/**
 * GenerateReportPage.jsx
 * 
 * This React component renders a form for generating a quick report based on selected filters.
 * It allows administrators to customize the report by selecting member statuses and including
 * specific personal and academic information fields. The component provides options to download
 * the report as a PDF.
 * 
 * Key Features:
 * - Allows users to select member statuses (active, general, or both) for the report.
 * - Provides checkboxes to include additional personal and academic information fields.
 * - Displays a styled form with clear sections for customization.
 * - Includes buttons to cancel the operation or generate and download the report.
 * 
 * Props:
 * - filters: Object containing the current filter values for the report.
 * - handleFilterChange: Function to handle changes to the filter values.
 * - handleClose: Function to close the report form.
 * - handleGenerateReport: Function to generate and download the report.
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * 
 * Functions:
 * - handleFilterChange: Updates the filter values based on user input.
 * - handleClose: Closes the form without generating a report.
 * - handleGenerateReport: Triggers the report generation and download process.
 * 
 * @component
 */
function GenerateReportPage({ filters, handleFilterChange, handleClose, handleGenerateReport }) {

  return (
    <Container>
      <Paper elevation={1} sx={style}>
        <Typography variant="h5">
          Quick Report Form
        </Typography>
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h6">
            Member Status
          </Typography>
          <RadioGroup
            name="memberStatus"
            value={filters.memberStatus}
            onChange={handleFilterChange}

          >
            <FormControlLabel value="active" control={<Radio />} label="Active and Exempt Members" />
            <FormControlLabel value="general" control={<Radio />} label="General (Inactive) Members" />
            <FormControlLabel value="both" control={<Radio />} label="Both" />
          </RadioGroup>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box>
          <Typography variant="h6">
              Personal Information
            </Typography>
            <FormGroup>
            <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includePhoneNumber}
                    onChange={handleFilterChange}
                    name="includePhoneNumber"
                  />
                }
                label="Phone Number"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includeClothingSize}
                    onChange={handleFilterChange}
                    name="includeClothingSize"
                  />
                }
                label="Clothing Sizes"
              />
            </FormGroup>
          </Box>
          <Box>
            <Typography variant="h6">
              Academic Information
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includeGraduationSemester}
                    onChange={handleFilterChange}
                    name="includeGraduationSemester"
                  />
                }
                label="Graduation Semester"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includeMajor}
                    onChange={handleFilterChange}
                    name="includeMajor"
                  />
                }
                label="Major"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includeAcademicYear}
                    onChange={handleFilterChange}
                    name="includeAcademicYear"
                  />
                }
                label="Academic Year"
              />
            </FormGroup>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ display: "flex", justifyContent: "right", gap: 4 }}>
          {/* <Box>
            <Button color="primary" sx={{ textDecoration: 'underline' }}>
              View Preview
            </Button>
          </Box> */}
          <Box sx={{ display: "flex", justifyContent: "right", gap: 4 }}>
            <Button variant="outlined" color="secondary" onClick={handleClose} sx={{ alignSelf: 'flex-start' }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleGenerateReport} endIcon={<PictureAsPdfIcon />} sx={{ alignSelf: 'flex-start' }}>
              Download
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default GenerateReportPage;