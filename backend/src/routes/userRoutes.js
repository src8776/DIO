const express = require('express');
const router = express.Router();
const passport = require('passport');
const Member = require('../models/Member');


//TODO: get data from database
const majors = [
  { id: 'computer_science', name: 'Computer Science' },
  { id: 'information_technology', name: 'Information Technology' },
  { id: 'software_engineering', name: 'Software Engineering' },
  { id: 'cybersecurity', name: 'Cybersecurity' },
  { id: 'data_science', name: 'Data Science' }
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

    // Ensure member exists before accessing properties
    const userProfile = {
      firstName: member?.FirstName || user.firstName || 'Unknown',
      email: user.email,
      studentYear: member?.AcademicYear || 'Unknown',
      graduationDate: member?.GraduationYear || 'Unknown',
      major: member?.Major || 'Unknown',
      shirtSize: member?.ShirtSize || 'Unknown',
      pantSize: member?.PantSize || 'Unknown'
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
      //firstName: updatedProfile.firstName,
      //lastName: updatedProfile.lastName,
      //fullName: `${updatedProfile.firstName} ${updatedProfile.lastName}`,
      //email: updatedProfile.email,
      email: member.email || user.email,
      firtName: member.FirstName || user.firstName,
      lastName: member.LastName || 'Unknown',
      GraduationDate: updatedProfile.graduationDate,
      Major: updatedProfile.major,
      //graduationYear: updatedProfile.graduationDate,
      //academicYear: updatedProfile.studentYear,
      ShirtSize: updatedProfile.shirtSize,
      PantSize: updatedProfile.pantSize
    };

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

module.exports = router;
