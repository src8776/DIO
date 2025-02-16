const express = require("express");
const cors = require('cors');
const { upload, handleFileUpload } = require('./upload/handleFileUpload');
const userRoutes = require('./routes/userRoutes');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/*
NOTE TO ALL!!! ALL BACKEND ROUTES SHOULD BEGIN WITH '/api/'!!!
THIS MAKE SURE WE KNOW WHAT IS BEING SENT TO BACKEND VERSUS FRONTEND
*/

//add admin route
const adminRoutes = require('./routes/admin.js');
app.use('/api/admin', adminRoutes); 

// Add OrganizationRules route
const organizationRulesRoutes = require('./routes/organizationRules.js');
app.use('/api/organizationRules', organizationRulesRoutes);

const organizationInfoRoutes = require('./routes/organizationInfo.js');
app.use('/api/organizationInfo', organizationInfoRoutes)

const memberDetailsRoutes = require('./routes/memberDetails.js');
app.use('/api/memberDetails', memberDetailsRoutes)

// For health check
app.get('/api/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

app.post('/api/upload', upload.single('csv_file'), handleFileUpload);

// TODO: Add more REST endpoints here
app.use('/api/user', userRoutes);  //points any api/user* calls from frontend to useRoutes file

module.exports = app;