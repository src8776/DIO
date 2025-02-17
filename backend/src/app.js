const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/*
NOTE TO ALL!!! ALL BACKEND ROUTES SHOULD BEGIN WITH '/api/'!!!
THIS MAKE SURE WE KNOW WHAT IS BEING SENT TO BACKEND VERSUS FRONTEND
*/

// For health check
app.get('/api/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

//add admin route
const adminRoutes = require('./routes/admin.js');
app.use('/api/admin', adminRoutes); 

// Add OrganizationRules route
const organizationRulesRoutes = require('./routes/organizationRules.js');
app.use('/api/organizationRules', organizationRulesRoutes);

const organizationInfoRoutes = require('./routes/organizationInfo.js');
app.use('/api/organizationInfo', organizationInfoRoutes);

const eventRoutes = require('./routes/events');
app.use('/api/admin/events', eventRoutes);

const memberRoutes = require('./routes/members');
app.use('/api/admin/members', memberRoutes);

app.post('/api/shib-user', (req, res) => {
    const { uid, givenName, surname, email } = req.body;

    console.log('Received Shibboleth User:', { uid, givenName, surname, email });

    res.json({ message: 'User data received successfully', user: { uid, givenName, surname, email } });
});

const { upload, handleFileUpload } = require('./upload/handleFileUpload');
app.post('/api/upload', upload.single('csv_file'), handleFileUpload);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);  //points any api/user* calls from frontend to userRoutes file


// TODO: Add more REST endpoints here
module.exports = app;