import React, { useEffect, useState } from 'react';
import {
  Box, Container, InputLabel, MenuItem,
  FormControl, Paper, Select,
  Typography, Button, TextField, Chip
} from '@mui/material';
import SnackbarAlert from '../../components/SnackbarAlert';

/**
 * AccountSetupPage.jsx
 * 
 * This React component renders a user interface for setting up or updating account information.
 * It includes fields for personal details such as name, email, student year, major, graduation term/year,
 * clothing sizes, race, gender, and phone number. The component fetches data from APIs for user profile,
 * selectable majors, and genders, and allows users to save their profile data to the backend.
 * 
 * Key Features:
 * - Fetches and displays user profile data from the backend.
 * - Dynamically populates dropdowns for majors and genders.
 * - Validates required fields and phone number format before submission.
 * - Displays success or error messages using a SnackbarAlert component.
 * - Tracks form completion status and adjusts the submit button label accordingly.
 * 
 * Dependencies:
 * - React, Material-UI components, and a custom SnackbarAlert component.
 * 
 * Functions:
 * - fetchUserProfileData: Fetches user profile data from the backend.
 * - fetchMajorData: Fetches a list of selectable majors from the backend.
 * - fetchGenderData: Fetches a list of selectable genders from the backend.
 * - saveProfileData: Sends updated profile data to the backend.
 * - parseTermCode: Parses a term code into a readable term and year format.
 * - handleSubmit: Validates and submits the form data to the backend.
 * 
 * Hooks:
 * - useState: Manages state for form fields, dropdown options, and alerts.
 * - useEffect: Loads initial data and monitors form completion status.
 * 
 * @component
 */

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

// Parse term code into term and year for display
const parseTermCode = (termCode) => {
  if (!termCode || termCode.length !== 4) {
    return { term: '', year: '' };
  }
  const yearDigits = termCode.slice(1, 3);
  const suffix = termCode.slice(3);
  const academicYear = 2000 + parseInt(yearDigits, 10);
  if (suffix === '1') {
    return { term: 'Fall', year: academicYear };
  } else if (suffix === '5') {
    return { term: 'Spring', year: academicYear + 1 };
  }
  return { term: '', year: '' };
};

export default function AccountSetup() {
  const [studentYear, setStudentYear] = useState('');
  const [graduationTerm, setGraduationTerm] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
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
  const [phoneNumber, setPhoneNumber] = useState('');
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
      if (profileData) {
        const { term, year } = parseTermCode(profileData.graduationSemester);
        setGraduationTerm(term);
        setGraduationYear(year);
        setFirstName(profileData.firstName);
        setFullName(profileData.fullName);
        setEmail(profileData.email);
        setStudentYear(profileData.academicYear);
        setMajor(profileData.majorID);
        setShirtSize(profileData.shirtSize);
        setPantSize(profileData.pantSize);
        setRace(profileData.race);
        setGender(profileData.gender);
        setPhoneNumber(profileData.phoneNumber);
      }
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
    if (studentYear && graduationTerm && graduationYear && major && shirtSize && pantSize) {
      setIsProfileComplete(true);
    } else {
      setIsProfileComplete(false);
    }
  }, [studentYear, graduationTerm, graduationYear, major, shirtSize, pantSize]); //react watches these for changes

  //when submitting, check if all fields are filled
  const handleSubmit = async () => {
    if (!isProfileComplete) {
      showAlert('You must fill out all required fields', 'error');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      showAlert('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    // Compute academicYear based on term and selected year
    const academicYear = graduationTerm === 'Spring' ? Number(graduationYear) - 1 : Number(graduationYear);
    const termCode = `2${String(academicYear).slice(-2)}${graduationTerm === 'Fall' ? '1' : '5'}`;

    const result = await saveProfileData({
      studentYear,
      graduationSemester: termCode,
      major,
      shirtSize,
      pantSize,
      race,
      gender,
      phoneNumber
    });

    if (result.success) {
      showAlert('Profile data saved successfully', 'success');
    } else {
      showAlert(`Failed to save profile data: ${result.message}`, 'error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Account Information
      </Typography>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Chip
              label={fullName}
              variant="filled"
              sx={{ fontSize: '1.25rem', height: 'auto', padding: .5 }}
            />
            <Chip
              label={email}
              variant="filled"
              sx={{ fontSize: '1.25rem', height: 'auto', padding: .5 }}
            />
          </Box>

          {/* Student Year and Major */}
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="student-year-select-label">Student Year</InputLabel>
              <Select
                required
                labelId="student-year-select-label"
                value={studentYear}
                label="Student Year"
                onChange={(e) => setStudentYear(e.target.value)}
              >
                <MenuItem value="freshman">Freshman</MenuItem>
                <MenuItem value="sophomore">Sophomore</MenuItem>
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="super_senior">Super Senior</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
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
          </Paper>

          {/* Graduation Term and Graduation Year */}
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="graduation-term-select-label">Graduation Term</InputLabel>
              <Select
                required
                labelId="graduation-term-select-label"
                value={graduationTerm}
                label="Graduation Term"
                onChange={(e) => setGraduationTerm(e.target.value)}
              >
                <MenuItem value="Fall">Fall</MenuItem>
                <MenuItem value="Spring">Spring</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="graduation-year-select-label">Graduation Year</InputLabel>
              <Select
                required
                labelId="graduation-year-select-label"
                value={graduationYear}
                label="Graduation Year"
                onChange={(e) => setGraduationYear(e.target.value)}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Shirt Size and Pant Size */}
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="shirt-size-select-label">Shirt Size</InputLabel>
              <Select
                required
                labelId="shirt-size-select-label"
                value={shirtSize}
                label="Shirt Size"
                onChange={(e) => setShirtSize(e.target.value)}
              >
                <MenuItem value="XS">XS</MenuItem>
                <MenuItem value="S">S</MenuItem>
                <MenuItem value="M">M</MenuItem>
                <MenuItem value="L">L</MenuItem>
                <MenuItem value="XL">XL</MenuItem>
                <MenuItem value="XXL">XXL</MenuItem>
                <MenuItem value="XXXL">XXXL</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="pant-size-select-label">Pant Size</InputLabel>
              <Select
                required
                labelId="pant-size-select-label"
                value={pantSize}
                label="Pant Size"
                onChange={(e) => setPantSize(e.target.value)}
              >
                <MenuItem value="28">28</MenuItem>
                <MenuItem value="30">30</MenuItem>
                <MenuItem value="32">32</MenuItem>
                <MenuItem value="34">34</MenuItem>
                <MenuItem value="36">36</MenuItem>
                <MenuItem value="38">38</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {/* Race and Gender */}
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="race-select-label">Race</InputLabel>
              <Select
                required
                labelId="race-select-label"
                value={race}
                label="Race"
                onChange={(e) => setRace(e.target.value)}
              >
                <MenuItem value="asian">Asian</MenuItem>
                <MenuItem value="black">Black or African American</MenuItem>
                <MenuItem value="eastern">Middle Eastern or North African</MenuItem>
                <MenuItem value="hispanic">Hispanic or Latino</MenuItem>
                <MenuItem value="native">American Indian or Alaska Native</MenuItem>
                <MenuItem value="islander">Native Hawaiian or other Pacific Islander</MenuItem>
                <MenuItem value="white">White</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
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
          </Paper>

          {/* Phone Number */}
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth margin="normal">
              <TextField
                required
                id="phoneNumber-input"
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
                inputProps={{
                  pattern: "[0-9]{10}",
                  maxLength: 10,
                }}
              />
            </FormControl>
          </Paper>

          <Button type="submit" variant="contained" fullWidth>
            {isProfileComplete ? 'Save Changes' : 'Complete Profile'}
          </Button>
        </Box>
      </form>
      <SnackbarAlert
        open={openSnackbar}
        message={alertMessage}
        severity={alertSeverity}
        onClose={() => setOpenSnackbar(false)}
      />
    </Container>
  );
}