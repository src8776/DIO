import React, { useEffect, useState } from 'react';
import { Box, Container, InputLabel, MenuItem, FormControl, Paper, Select, Typography, Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import NavColumn from '../../components/NavColumn';
import dayjs from 'dayjs';
// TODO: Make sure NavColumn is only displayed if user is an Admin
// TODO: Add API calls to get user's name and email
// TODO: Add API calls to get major data
// TODO: Add API calls to save profile information to database
// TODO: Set this up so that the user sees this page upon first login, and cannot access other pages until this page is completed
// TODO: Add form validation
// TODO: Allow user to return to this page to update their profile information
// TODO: Load existing profile information if it exists
// TODO: Change 'complete profile' button to 'save changes' button if user is updating profile information

const fetchUserProfileData = async () => {
  // Replace with actual API call
  return {
    firstName: 'John',
    email: 'jd9217@rit.edu',
    studentYear: 'junior',
    graduationDate: '2025-05-01',
    major: 'computer_science',
    shirtSize: 'M',
    pantSize: '32'
  };
};

const fetchMajorData = async () => {
  // Replace with actual API call
  return [
    { id: 'computer_science', name: 'Computer Science' },
    { id: 'information_technology', name: 'Information Technology' },
    { id: 'software_engineering', name: 'Software Engineering' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'data_science', name: 'Data Science' }
  ];
};

const saveProfileData = async (data) => {
  // Replace with actual API call to save data
  console.log('Saving profile data:', data);
};

export default function AccountSetup() {

  const [studentYear, setStudentYear] = useState('');
  const [graduationDate, setGraduationDate] = useState(null);
  const [major, setMajor] = useState('');
  const [shirtSize, setShirtSize] = useState('');
  const [pantSize, setPantSize] = useState('');
  const [majors, setMajors] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const profileData = await fetchUserProfileData();
      setFirstName(profileData.firstName);
      setEmail(profileData.email);
      setStudentYear(profileData.studentYear);
      setGraduationDate(profileData.graduationDate);
      setMajor(profileData.major);
      setShirtSize(profileData.shirtSize);
      setPantSize(profileData.pantSize);
    };

    const loadMajors = async () => {
      const majorList = await fetchMajorData();
      setMajors(majorList);
    };

    loadUserData();
    loadMajors();
  }, []);

  //when something changes, check if fields are filled, if so make true; if not, false
  useEffect(() => {
    if (studentYear && graduationDate && major && shirtSize && pantSize) {
      setIsProfileComplete(true);
    } else {
      setIsProfileComplete(false);
    }
  }, [studentYear, graduationDate, major, shirtSize, pantSize]); //react watches these for changes

  //when submitting, check if all fields are filled
  const handleSubmit = async () => {
    if (isProfileComplete) {
      alert('Please fill in all required fields');
      return;
    }

    //calls saveProfileData function to save data; waits for this to finish
    await saveProfileData({
      studentYear,
      graduationDate,
      major,
      shirtSize,
      pantSize
    });

  };

  return (
    <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      {/* NavColumn goes away on mobile and links should appear in hamburger menu */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <NavColumn pageTitle="Account Setup" />
      </Box>

      <Paper component="form" sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', p: 2, gap: 2 }}>
        <Typography variant='h5' >
          Account Settings
        </Typography>
        <Paper elevation={1} sx={{ minWidth: '100%', }}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', gap: 2 }}>
              {/* TODO: Get user's name */}
              <Typography variant='h6'>
                Name: {firstName}
              </Typography>
              {/* TODO: Get user's email */}
              <Typography variant='h6'>
                Email: {email}
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
                  onChange={(e) => setStudentYear(e.target.value)}
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
                  value={graduationDate ? dayjs(graduationDate) : null}
                  onChange={(newDate) => {
                    //console.log("Selected Date:", newDate); // for debugging
                    setGraduationDate(newDate); 
                  }}
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
                onChange={(e) => setMajor(e.target.value)}
              >
                {majors.map((majorItem) => (
                  <MenuItem key={majorItem.id} value={majorItem.id}>
                    {majorItem.name}
                  </MenuItem>
                ))}
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
                  onChange={(e) => setShirtSize(e.target.value)}
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
                  onChange={(e) => setPantSize(e.target.value)}
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
        <Box sx={{ display: "flex", justifyContent: "end" }}>
          <Button variant='contained'>
            {isProfileComplete ? 'Save Changes' : 'Complete Profile'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}