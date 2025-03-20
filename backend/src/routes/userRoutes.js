const express = require('express');
const router = express.Router();
const passport = require('passport');
const Member = require('../models/Member');
const OrgMember = require('../models/OrganizationMember');


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

const attachMemberData = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = req.user;
    const member = await Member.getMemberByEmail(user.email);
    const orgMember = await OrgMember.getMemberByID(member.MemberID);
    console.log("Member Data:", orgMember);
    req.member = member || {}; // Attach member data to the request object
    req.orgMember = orgMember || {};
    next(); // Move to the next middleware/route handler
  } catch (error) {
    console.error('Error fetching member data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// profile route
router.get('/profile', attachMemberData, async (req, res) => {
    const member = req.member;
    const user = req.user;
    console.log("Grabbing Member Data:", member);

    let majorTitle = await Member.getMajorById(member?.MajorID);
    console.log("Major Title:", majorTitle);

    // Ensure member exists before accessing properties
    const userProfile = {
      username: member?.UserName || user.username || 'Unknown',
      firstName: member?.FirstName || user.firstName || 'Unknown',
      lastName: member?.LastName || user.lastName || 'Unknown',
      email: user.email,
      fullName: member?.FullName || `${user.firstName} ${user.lastName}` || 'Unknown',
      majorID: majorTitle || 'Unknown',
      graduationDate: member?.GraduationYear || 'Unknown',
      academicYear: member?.AcademicYear,
      shirtSize: member?.ShirtSize || 'Unknown',
      pantSize: member?.PantSize || 'Unknown',
      gender: member?.Gender || 'Unknown',
      race: member?.Race || 'Unknown',
    };

    res.json(userProfile);
});

//profile saving
router.post('/profile', attachMemberData, async (req, res) => {
    const user = req.user;
    const updatedProfile = req.body;
    const member = req.member;

    let majorID = await Member.getMajorIdByTitle(updatedProfile.major);
    console.log("Major ID:", majorID);
    // Prepare member object
    const memberData = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      majorID: majorID,
      graduationYear: updatedProfile.graduationDate,
      academicYear: updatedProfile.studentYear,
      shirtSize: updatedProfile.shirtSize,
      pantSize: updatedProfile.pantSize,
      gender: updatedProfile.gender,
      race: updatedProfile.race,
    };

    console.log("Inserting Member:", memberData);
    try {
      const memberId = await Member.insertMember(memberData);
      res.status(200).json({ message: 'Profile updated successfully', memberId });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
});

/*
router.get('/majors', (req, res) => {
  res.json(majors);
});
*/
router.get('/genders', attachMemberData, (req, res) => {
  res.json(genders);
});

router.get('/memberID', attachMemberData, (req, res) => {
  const memberID = req.member.MemberID;
  res.json({ memberID });
})

router.get('/majors', attachMemberData, async (req, res) => {
  try {
      const majors = await Member.getMajors();
      res.json(majors);
  } catch (error) {
      console.error('Error fetching majors:', error);
      res.status(500).json({ message: 'Server error' });
  }
});



//Code for getting member role
router.get('/memberRole', attachMemberData, async (req, res) => {
  const orgMember = req.orgMember;
  const org = orgMember.OrganizationID;
  const role = orgMember.RoleID;
  res.json({ role });
});

/*
router.get('/memberRole', attachMemberData, async (req, res) => {
  const memberID = req.member.MemberID;
  const orgID = req.query.orgID;
  const role = await OrgMember.getRoleByMemberIDOrgID(memberID, orgID);
  res.json({ role });
});
*/
module.exports = router;
