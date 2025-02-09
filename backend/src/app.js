const express = require("express");
const cors = require('cors');
const { upload, handleFileUpload } = require('./upload/handleFileUpload');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());

// For health check
app.get('/api/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

app.post('/api/upload', upload.single('csv_file'), handleFileUpload);

// TODO: Add more REST endpoints here
app.use('/api/user', userRoutes);  //points any api/user* calls from frontend to useRoutes file

module.exports = app;