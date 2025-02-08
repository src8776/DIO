const express = require("express");
const cors = require('cors');
const { upload, handleFileUpload } = require('./upload/handleFileUpload');
const app = express();



app.use((req, res, next) => {
    console.log('Shibboleth Headers:', req.headers);  // Log all headers to the console
    next();
  });
  
  app.get('/test-shibboleth', (req, res) => {
    // get user data from headers
    const shibbolethUser = req.headers['uid'];
    const shibbolethEmail = req.headers['mail'];
  
    console.log('Shibboleth User:', shibbolethUser);
    console.log('Shibboleth Email:', shibbolethEmail);
  
    // Send to the frontend
    res.json({
      user: shibbolethUser,
      email: shibbolethEmail,
    });
  });



app.use(cors());

// For health check
app.get('/api/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

app.post('/api/upload', upload.single('csv_file'), handleFileUpload);

// TODO: Add more REST endpoints here

module.exports = app;