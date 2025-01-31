import React from 'react';
import { Box, Container, InputLabel, MenuItem, FormControl, Paper, Select, Typography, Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import NavColumn from '../../components/NavColumn';

// TODO: Add API calls to get user's name and email
// TODO: Add API calls to get major data
// TODO: Add API calls to save profile information to database
// TODO: Set this up so that the user sees this page upon first login, and cannot access other pages until this page is completed
// TODO: Add form validation
// TODO: Allow user to return to this page to update their profile information

export default function AccountSetup() {

  const [studentYear, setStudentYear] = React.useState('');
  const [graduationDate, setGraduationDate] = React.useState(null);
  const [major, setMajor] = React.useState('');
  const [shirtSize, setShirtSize] = React.useState('');
  const [pantSize, setPantSize] = React.useState('');

  const handleStudentYearChange = (event) => {
    setStudentYear(event.target.value);
  };

  const handleDateChange = (newDate) => {
    setGraduationDate(newDate);
  };

  const handleMajorChange = (event) => {
    setMajor(event.target.value);
  };

  const handleShirtSizeChange = (event) => {
    setShirtSize(event.target.value);
  };

  const handlePantSizeChange = (event) => {
    setPantSize(event.target.value);
  };

  return (
    <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      {/* NavColumn goes away on mobile and links should appear in hamburger menu */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <NavColumn pageTitle="Account Setup" />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
        <Typography variant='h5' >
          Account Setup
        </Typography>
        <Paper elevation={1} sx={{ minWidth: '100%', }}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', gap: 2 }}>
              {/* TODO: Get user's name */}
              <Typography variant='h6'>
                First Name: John Doe
              </Typography>
              {/* TODO: Get user's email */}
              <Typography variant='h6'>
                Email: jd9217@rit.edu
              </Typography>
            </Box>
            <Box component={'form'} sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="student-year-select-label">Student Year</InputLabel>
                <Select
                  required
                  labelId="student-year-select-label"
                  id="student-year-select"
                  value={studentYear}
                  label="Student Year"
                  onChange={handleStudentYearChange}
                >
                  <MenuItem value={'freshman'}>Freshman</MenuItem>
                  <MenuItem value={'sophomore'}>Sophomore</MenuItem>
                  <MenuItem value={'junior'}>Junior</MenuItem>
                  <MenuItem value={'senior'}>Senior</MenuItem>
                  <MenuItem value={'super_senior'}>Super Senior</MenuItem>
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Graduation Date"
                  value={graduationDate}
                  onChange={handleDateChange}
                  sx={{ flex: 1 }}
                />
              </LocalizationProvider>
            </Box>
            <FormControl fullWidth>
              <InputLabel id="major-select-label">Major</InputLabel>
              <Select
                required
                labelId="major-select-label"
                id="major-select"
                value={major}
                label="Major"
                onChange={handleMajorChange}
              >
                {/* TODO: Replace hardcoded values with API data */}
                <MenuItem value={'computer_science'}>Computer Science</MenuItem>
                <MenuItem value={'information_technology'}>Information Technology</MenuItem>
                <MenuItem value={'software_engineering'}>Software Engineering</MenuItem>
                <MenuItem value={'cybersecurity'}>Cybersecurity</MenuItem>
                <MenuItem value={'data_science'}>Data Science</MenuItem>
              </Select>
            </FormControl>
            <Box component={'form'} sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="shirt-size-select-label">Shirt Size</InputLabel>
                <Select
                  required
                  labelId="shirt-size-select-label"
                  id="shirt-size-select"
                  value={shirtSize}
                  label="Shirt Size"
                  onChange={handleShirtSizeChange}
                >
                  <MenuItem value={'S'}>S</MenuItem>
                  <MenuItem value={'M'}>M</MenuItem>
                  <MenuItem value={'L'}>L</MenuItem>
                  <MenuItem value={'XL'}>XL</MenuItem>
                  <MenuItem value={'XXL'}>XXL</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="pant-size-select-label">Pant Size</InputLabel>
                <Select
                  required
                  labelId="pant-size-select-label"
                  id="pant-size-select"
                  value={pantSize}
                  label="Pant Size"
                  onChange={handlePantSizeChange}
                >
                  <MenuItem value={'28'}>28</MenuItem>
                  <MenuItem value={'30'}>30</MenuItem>
                  <MenuItem value={'32'}>32</MenuItem>
                  <MenuItem value={'34'}>34</MenuItem>
                  <MenuItem value={'36'}>36</MenuItem>
                  <MenuItem value={'38'}>38</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        {/* TODO: Make this button save profile information to database */}
        <Button variant='contained'>
          Complete Profile
        </Button>
      </Box>
    </Container>
  );
}