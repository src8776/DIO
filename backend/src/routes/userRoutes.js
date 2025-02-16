const express = require('express');
const router = express.Router();

//TODO: get data from database
const userProfile = {
  firstName: 'John',
  email: 'jd9217@rit.edu',
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

// get organization(s) for user
router.get('/:memberID/orgs', async (req, res) => {
  const {memberID} = req.params;

  try {
    const query = ``;
    
    const [rows] = await db.query(query, [memberID]);

    res.json(rows); 
  } catch (error) {
    console.error('Database query error: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// get attendance history for current semester
router.get('/:memberID/attendance/:semester', async (req, res) => {
  const {memberID, semester} = req.params;

  try {
    const query = ``;
    
    const [rows] = await db.query(query, [memberID, semester]);

    res.json(rows); 
  } catch (error) {
    console.error('Database query error: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// get user's awards
router.get('/:memberID/awards', async (req, res) => {
  const {memberID} = req.params;

  try {
    const query = ``;

    const [rows] = await db.query(query, [memberID]);

    res.json(rows);
  } catch (error) {
    console.error('Darabase query error: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// get user settings (year, graduation date, major, shirt + pants size)
router.get('/:memberID/settings', async (req, res) => {
  const {memberID} = req.params;

  try {
    const query = ``;

    const [rows] = await db.query(query, [memberID]);

    res.json(rows);
  } catch (error) {
    console.error('Darabase query error: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

// Update user settings (year, graduation date, major, shirt + pants size)
router.put('/:memberID/settings', async (req, res) => {
  const {memberID} = req.params;
  const {year, graduation, major, shirtSize, pantSize} = req.body;

  if (!year && !graduation && !major && !shirtSize && !pantSize) {
    return res.status(400).json({error: 'No fields to update'});
  }

  try {
    const query = ``;

    const [result] = await db.query(query, [
      year, graduation, major, shirtSize, pantSize, memberID
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({error: 'User not found or no changes made'});
    }

    res.json({ message: 'User settings updated successfully' });
  } catch (error) {
    console.error('Database query error: ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

module.exports = router;
