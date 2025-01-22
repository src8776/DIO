const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Set up a storage for Multer
const storage = multer.diskStorage({
  destination: './uploads', // Folder to save files
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize the Multer middleware
const upload = multer({ storage: storage });

// Middleware for testing uploads
app.use(express.static(path.join(__dirname, 'public')));

// Route for the upload form
app.get('/', (req, res) => {
  res.send(`
    <h1>File Upload Form</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  `);
});

// Route to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send(`File uploaded successfully: ${req.file.filename}`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});