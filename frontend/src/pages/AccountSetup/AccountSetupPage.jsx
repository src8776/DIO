import React, { useEffect, useState } from 'react';
import { Box, Container, InputLabel, MenuItem, FormControl, Paper, Select, Typography, Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// TODO: Set this up so that the user sees this page upon first login, and cannot access other pages until this page is completed
// TODO: Add form validation

useEffect(() => {
  fetch('/api/user')
      .then(response => response.json())
      .then(data => {
          console.log('Shibboleth User Data:', data);
          setUser(data);
      })
      .catch(error => console.error('Error fetching user:', error));
}, []);



//Fetch profile data from the profile api defined in userRoutes
const fetchUserProfileData = async () => {
  try {
    const response = await fetch('/api/user/profile');
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

//Fetch selectable majors from the majors api defined in userRoutes
const fetchMajorData = async () => {
  try {
    const response = await fetch('/api/user/majors');
    if (!response.ok) throw new Error('Failed to fetch majors');
    return await response.json();
  } catch (error) {
    console.error('Error fetching majors:', error);
    return [];
  }
};

//Pushes profile data to backend to save using the profile api
const saveProfileData = async (data) => {
  const response = await fetch('/api/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  console.log(result.message);
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
    if (!isProfileComplete) {
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
    <Container sx={{width: { xs: '100%', md: '50%' }, p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2}}>

      <Paper component="form" sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', p: 2, gap: 2 }}>
        <Typography variant='h5' >Account Settings</Typography>

        <Paper elevation={1} sx={{ minWidth: '100%', }}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', gap: 2 }}>
              <Typography variant='h6'>Name: {firstName}</Typography>
              <Typography variant='h6'>Email: {email}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="student-year-select-label">Student Year</InputLabel>
                <Select
                  required
                  labelId="student-year-select-label"
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
                  onChange={(newDate) => { setGraduationDate(newDate) }}
                  sx={{ flex: 1 }}
                />
              </LocalizationProvider>
            </Box>

            <FormControl fullWidth>
              <InputLabel id="major-select-label">Major</InputLabel>
              <Select
                required
                labelId="major-select-label"
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="shirt-size-select-label">Shirt Size</InputLabel>
                <Select
                  required
                  labelId="shirt-size-select-label"
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

        <Box sx={{ display: "flex", justifyContent: "end" }}>
          <Button variant='contained' onClick={handleSubmit}>
            {isProfileComplete ? 'Save Changes' : 'Complete Profile'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}