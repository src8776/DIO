const express = require("express");
const cors = require('cors');
const { upload, handleFileUpload } = require('./upload/handleFileUpload');

const app = express();
app.use(cors());

// For health check
app.get('/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

app.post('/upload', upload.single('csv_file'), handleFileUpload);

// TODO: Add more REST endpoints here

module.exports = app;