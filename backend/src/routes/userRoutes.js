/**
 * @file userRoutes.js
 * @description This file contains the routes for user-related operations, including profile management, access control, and member data retrieval.
 */

const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const OrgMember = require('../models/OrganizationMember');

// Predefined lists of genders
const genders = [
  { id: 'Male', name: 'Male' },
  { id: 'Female', name: 'Female' },
  { id: 'Transgender', name: 'Transgender' },
  { id: 'Nonbinary', name: 'Nonbinary' },
  { id: 'Unknown', name: 'Other' }
];

/**
 * Middleware to attach member data to the request object.
 */
const attachMemberData = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = req.user;
    const member = await Member.getMemberByEmail(user.email);
    const orgMember = await OrgMember.getMemberByID(member.MemberID);
    const WicMember = await OrgMember.getWicMemberByID(member.MemberID,1);
    const ComsMember = await OrgMember.getComsMemberByID(member.MemberID,2);

    req.member = member || {}; // Attach member data to the request object
    req.orgMember = orgMember || {};
    req.WicMember = WicMember || null;
    req.ComsMember = ComsMember || null;
    
    next(); // Move to the next middleware/route handler
  } catch (error) {
    console.error('Error fetching member data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Route to get the user's profile.
 */
router.get('/profile', attachMemberData, async (req, res) => {
    const { member, user } = req;

    try {
      const majorTitle = await Member.getMajorById(member?.MajorID);
  
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
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Route to save the user's profile.
 */
router.post('/profile', attachMemberData, async (req, res) => {
    const user = req.user;
    const updatedProfile = req.body;

    try {
      const majorID = await Member.getMajorIdByTitle(updatedProfile.major);
  
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
  
      const memberId = await Member.updateMemberProfile(memberData);
      res.status(200).json({ message: 'Profile updated successfully', memberId });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Route to get the list of genders.
 */
router.get('/genders', attachMemberData, (req, res) => {
  res.json(genders);
});

/**
 * Route to get the member ID.
 */
router.get('/memberID', attachMemberData, (req, res) => {
  const memberID = req.member.MemberID;
  res.json({ memberID });
})

/**
 * Route to get the list of majors.
 */
router.get('/majors', attachMemberData, async (req, res) => {
  try {
      const majors = await Member.getMajors();
      res.json(majors);
  } catch (error) {
      console.error('Error fetching majors:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Route to check if the member is in WIC.
 */
router.get('/inWic', attachMemberData, async (req, res) => {
  const inWic = req.WicMember;
  //console.log("In WIC:", inWic);
  res.json({ inWic });
});

/**
 * Route to check if the member is in COMS.
 */
router.get('/inComs', attachMemberData, async (req, res) => {
  const inComs = req.ComsMember;
  //console.log("In COMS:", inComs);
  res.json({ inComs });
});

/**
 * Route to check if the user's profile is complete.
 */
router.get('/profileCompletion', attachMemberData, async (req, res) => {
  const member = req.member;
  let isCompleted = true;
  console.log("Member Data:", member);
  // Check if any of the member's properties are null
  if (
    !member.AcademicYear ||
    !member.GraduationYear ||
    !member.MajorID ||
    !member.ShirtSize ||
    !member.PantSize ||
    !member.Race ||
    !member.Gender
  ) {
    isCompleted = false;
  }
  console.log("Profile Completion Status:", isCompleted);
  res.json({ isCompleted });
});

module.exports = router;
