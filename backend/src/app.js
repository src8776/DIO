const express = require("express");
const cors = require('cors');
const { upload, handleFileUpload } = require('./upload/handleFileUpload');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());

// For health check
app.get('/api/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

app.post('/api/upload', upload.single('csv_file'), handleFileUpload);

// TODO: Add more REST endpoints here
app.use('/admin', adminRoutes);

module.exports = app;