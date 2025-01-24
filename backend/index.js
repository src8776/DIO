const express = require("express");
const cors = require('cors');
const { upload, handleFileUpload } = require('./handleFileUpload');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

// For health check
app.get('/health', (req, res) => {
    res.status(200).send('SERVER UP');
});

app.post('/upload', upload.single('csv_file'), handleFileUpload);

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
