const express = require('express');
const router = express.Router();
const passport = require('passport');
const Member = require('../models/Member');



const majors = [
  { id: 'computer_science', name: 'Computer Science' },
  { id: 'information_technology', name: 'Information Technology' },
  { id: 'software_engineering', name: 'Software Engineering' },
  { id: 'cybersecurity', name: 'Cybersecurity' },
  { id: 'data_science', name: 'Data Science' }
];

const genders = [
  { id: 'Male', name: 'Male' },
  { id: 'Female', name: 'Female' },
  { id: 'Transgender', name: 'Transgender' },
  { id: 'Nonbinary', name: 'Nonbinary' },
  { id: 'Unknown', name: 'Other' }
];


// profile route
router.get('/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  try {
    const user = req.user;

    // Fetch member data from the database
    const member = await Member.getMemberByEmail(user.email);
    console.log("Grabbing Member Data:", member);

    // Ensure member exists before accessing properties
    const userProfile = {
      username: member?.UserName || user.username || 'Unknown',
      firstName: member?.FirstName || user.firstName || 'Unknown',
      lastName: member?.LastName || user.lastName || 'Unknown',
      email: user.email,
      fullName: member?.FullName || `${user.firstName} ${user.lastName}` || 'Unknown',
      major: member?.Major || 'Unknown',
      graduationDate: member?.GraduationYear || 'Unknown',
      academicYear: member?.AcademicYear,
      shirtSize: member?.ShirtSize || 'Unknown',
      pantSize: member?.PantSize || 'Unknown',
      gender: member?.Gender || 'Unknown',
      race: member?.Race || 'Unknown',
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//profile saving
router.post('/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = req.user;
    const updatedProfile = req.body;

    /*
    if (updatedProfile.email !== user.email) {
      return res.status(403).json({ message: 'Email cannot be changed' });
    }
*/
    // Prepare member object
    const memberData = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      major: updatedProfile.major,
      graduationYear: updatedProfile.graduationDate,
      academicYear: updatedProfile.studentYear,
      shirtSize: updatedProfile.shirtSize,
      pantSize: updatedProfile.pantSize,
      gender: updatedProfile.gender,
      race: updatedProfile.race,
    };

    console.log("Inserting Member:", memberData);
    // Insert or update member in the database
    const memberId = await Member.insertMember(memberData);

    res.status(200).json({ message: 'Profile updated successfully', memberId });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/majors', (req, res) => {
  res.json(majors);
});

router.get('/genders', (req, res) => {
  res.json(genders);
});

module.exports = router;
