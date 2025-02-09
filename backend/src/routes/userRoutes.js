const express = require('express');
const router = express.Router();

const userProfile = {
  firstName: 'John',
  email: 'jd9217@rit.edu',
  studentYear: 'junior',
  graduationDate: '2025-05-01',
  major: 'computer_science',
  shirtSize: 'M',
  pantSize: '32'
};

const majors = [
  { id: 'computer_science', name: 'Computer Science' },
  { id: 'information_technology', name: 'Information Technology' },
  { id: 'software_engineering', name: 'Software Engineering' },
  { id: 'cybersecurity', name: 'Cybersecurity' },
  { id: 'data_science', name: 'Data Science' }
];

// profile route
router.get('/profile', (req, res) => {
  res.json(userProfile);
});

// major route
router.get('/majors', (req, res) => {
  res.json(majors);
});

module.exports = router;
