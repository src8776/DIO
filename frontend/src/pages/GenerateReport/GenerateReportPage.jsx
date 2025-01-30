import React from 'react';
import { Box, Button, Typography, FormGroup, FormControlLabel, Checkbox, TextField, Paper, Container } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
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


function GenerateReportPage({ filters, handleFilterChange, handleDateChange, handleClose, handleGenerateReport }) {

  return (
    <Container>
      <Paper elevation={1} sx={style}>
        <Typography variant="h5">
          Generate Report
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.activeOnly}
                onChange={handleFilterChange}
                name="activeOnly"
              />
            }
            label="Include Active Members Only"
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', pt: 2, gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                name="dateRangeStart"
                value={filters.dateRangeStart}
                onChange={(newValue) => handleDateChange("dateRangeStart", newValue)}
                sx={{ flex: 1 }}
              />
              <DatePicker
                label="End Date"
                name="dateRangeEnd"
                value={filters.dateRangeEnd}
                onChange={(newValue) => handleDateChange("dateRangeEnd", newValue)}
                sx={{ flex: 1 }}
              />
            </LocalizationProvider>
          </Box>
        </FormGroup>

        <Box sx={{ display: "flex", justifyContent: "space-between", m: 3, gap: 4 }}>
          <Button variant="contained" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleGenerateReport}>
            Generate
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default GenerateReportPage;