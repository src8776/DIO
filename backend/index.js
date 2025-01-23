const express = require("express");
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

// For health check
app.get('/health', (req, res) => {
  res.status(200).send('SERVER UP');
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

const upload = multer({ storage });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

app.post('/upload', upload.single('file'), (req, res) => {
    console.log("invoke /upload");
    if (req.file) {
      res.json({ message: 'File uploaded successfully', file: req.file });
    } else {
      res.status(400).json({ error: 'No file uploaded' });
    }
  });

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});