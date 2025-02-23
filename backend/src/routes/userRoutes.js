const express = require('express');
const router = express.Router();

const user = req.user;

//TODO: get data from database
const userProfile = {
  firstName: user['urn:oid:2.5.4.42'],
  email: user['urn:oid:0.9.2342.19200300.100.1.3'],
  studentYear: 'junior',
  graduationDate: '2025-05-01',
  major: 'computer_science',
  shirtSize: 'M',
  pantSize: '32'
};

//TODO: get data from database
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

//profile saving
router.post('/profile', (req, res) => {
    const updatedProfile = req.body;
    
    //TODO: save to database
    console.log("Received profile update:", updatedProfile);
  
    res.status(200).json({ message: "Profile updated successfully" });
  });

// major route
router.get('/majors', (req, res) => {
  res.json(majors);
});

module.exports = router;
