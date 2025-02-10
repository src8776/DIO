const express = require("express");
const cors = require('cors');
const { upload, handleFileUpload } = require('./upload/handleFileUpload');

const app = express();
app.use(cors());

//add admin route
const adminRoutes = require('./routes/admin.js');
app.use('/admin', adminRoutes); 

// Add OrganizationRules route
const organizationRulesRoutes = require('./routes/organizationRules.js');
app.use('/organizationRules', organizationRulesRoutes);

// For health check
app.get('/api/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

app.post('/api/upload', upload.single('csv_file'), handleFileUpload);

// TODO: Add more REST endpoints here

module.exports = app;