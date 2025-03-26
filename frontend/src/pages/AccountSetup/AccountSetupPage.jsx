import React, { useEffect, useState } from 'react';
import { Box, Container, InputLabel, MenuItem, FormControl, Paper, Select, Typography, Button } from '@mui/material';
import SnackbarAlert from '../../components/SnackbarAlert';


// TODO: Set this up so that the user sees this page upon first login, and cannot access other pages until this page is completed
// TODO: Add form validation
// TODO: Add Race & Gender fields (text fields or select?)

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

//Fetch selectable genders from the genders api defined in userRoutes
const fetchGenderData = async () => {
  try {
    const response = await fetch('/api/user/genders');
    if (!response.ok) throw new Error('Failed to fetch genders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching genders:', error);
    return [];
  }
};

//Pushes profile data to backend to save using the profile api
const saveProfileData = async (data) => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save profile data');
    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error saving profile data:', error);
    return { success: false, message: error.message };
  }
};

export default function AccountSetup() {
  const [studentYear, setStudentYear] = useState('');
  const [graduationDate, setGraduationDate] = useState(null);
  const [major, setMajor] = useState('');
  const [shirtSize, setShirtSize] = useState('');
  const [pantSize, setPantSize] = useState('');
  const [majors, setMajors] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [race, setRace] = useState('');
  const [gender, setGender] = useState('');
  const [genders, setGenders] = useState([]);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setOpenSnackbar(true);
  };

  useEffect(() => {
    const loadUserData = async () => {
      const profileData = await fetchUserProfileData();
      console.log("Profile Data:", profileData);
      setFirstName(profileData.firstName);
      setFullName(profileData.fullName);
      setEmail(profileData.email);
      setStudentYear(profileData.academicYear);
      setGraduationDate(profileData.graduationDate);
      setMajor(profileData.majorID);
      setShirtSize(profileData.shirtSize);
      setPantSize(profileData.pantSize);
      setRace(profileData.race);
      setGender(profileData.gender)
    };

    const loadMajors = async () => {
      const majorList = await fetchMajorData();
      setMajors(majorList);
    };

    const loadGenders = async () => {
      const genderList = await fetchGenderData();
      setGenders(genderList);
    };

    loadUserData();
    loadMajors();
    loadGenders();
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
      showAlert('You must fill out all required fields', 'error');
      return;
    }

    const result = await saveProfileData({
      studentYear,
      graduationDate,
      major,
      shirtSize,
      pantSize,
      race,
      gender
    });

    if (result.success) {
      showAlert('Profile data saved successfully', 'success');
    } else {
      showAlert(`Failed to save profile data: ${result.message}`, 'error');
    }
  };

  return (
    <Container sx={{ width: { xs: '100%', md: '50%' }, p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>

      <Paper component="form" sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', p: 2, gap: 2 }}>
        <Typography variant='h5' >Account Settings</Typography>

        <Paper elevation={1} sx={{ minWidth: '100%', }}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', gap: 2 }}>
              <Typography variant='h6'>Name: {fullName}</Typography>
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


              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="graduation-year-select-label">Graduation Year</InputLabel>
                <Select
                  required
                  labelId="graduation-year-select-label"
                  value={graduationDate || ''}
                  label="Graduation Year"
                  onChange={(e) => setGraduationDate(e.target.value)}
                >
                  {Array.from({ length: 88 }, (_, i) => 1990 + i).map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                  <MenuItem key={majorItem.Title} value={majorItem.Title}>
                    {majorItem.Title}
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
                  <MenuItem value={'XS'}>XS</MenuItem>
                  <MenuItem value={'S'}>S</MenuItem>
                  <MenuItem value={'M'}>M</MenuItem>
                  <MenuItem value={'L'}>L</MenuItem>
                  <MenuItem value={'XL'}>XL</MenuItem>
                  <MenuItem value={'XXL'}>XXL</MenuItem>
                  <MenuItem value={'XXXL'}>XXXL</MenuItem>
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="race-select-label">Race</InputLabel>
                <Select
                  required
                  labelId="race-select-label"
                  value={race}
                  label="Race"
                  onChange={(e) => setRace(e.target.value)}
                >
                  <MenuItem value={'asian'}>Asian</MenuItem>
                  <MenuItem value={'black'}>Black or African American</MenuItem>
                  <MenuItem value={'eastern'}>Middle Eastern or North African</MenuItem>
                  <MenuItem value={'hispanic'}>Hispanic or Latino</MenuItem>
                  <MenuItem value={'native'}>American Indian or Alaska Native</MenuItem>
                  <MenuItem value={'islander'}>Native Hawaiian or other Pacific Islander</MenuItem>
                  <MenuItem value={'white'}>White</MenuItem>
                  <MenuItem value={'other'}>Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="gender-select-label">Gender</InputLabel>
                <Select
                  required
                  labelId="gender-select-label"
                  value={gender}
                  label="Gender"
                  onChange={(e) => setGender(e.target.value)}
                >
                  {genders.map((genderItem) => (
                    <MenuItem key={genderItem.id} value={genderItem.id}>
                      {genderItem.name}
                    </MenuItem>
                  ))}
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
      <SnackbarAlert
        open={openSnackbar}
        message={alertMessage}
        severity={alertSeverity}
        onClose={() => setOpenSnackbar(false)}
      />
    </Container>

  );
}