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