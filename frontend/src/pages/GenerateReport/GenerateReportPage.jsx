import React from 'react';
import {
  Box, Button, Typography,
  FormGroup, FormControlLabel,
  Checkbox, Paper,
  Container, Divider
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
        <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.includeActiveStatus}
                onChange={handleFilterChange}
                name="includeActiveStatus"
              />
            }
            label="Active Members"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.includeInactiveStatus}
                onChange={handleFilterChange}
                name="includeInactiveStatus"
              />
            }
            label="Inactive Members"
          />
        </FormGroup>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box>
            <Typography variant="h6">
              Personal Information
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includeFullName}
                    onChange={handleFilterChange}
                    name="includeFullName"
                  />
                }
                label="Full Name"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.includeEmail}
                    onChange={handleFilterChange}
                    name="includeEmail"
                  />
                }
                label="Email"
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
                    checked={filters.includeGraduationYear}
                    onChange={handleFilterChange}
                    name="includeGraduationYear"
                  />
                }
                label="Graduation Year"
              />
            </FormGroup>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
          <Box>
            {/* TODO: Make this do something */}
            <Button color="primary" sx={{ textDecoration: 'underline' }}>
              View Preview
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "right", gap: 4 }}>
            <Button variant='outlined' color="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleGenerateReport} endIcon={<PictureAsPdfIcon />}>
              Download
            </Button>

          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default GenerateReportPage;