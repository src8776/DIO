const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csvProcessor = require('./loadCsv');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'tmp/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
}

const handleFileUpload = (req, res) => {
    console.log("invoke /upload");
    if (req.file) {
        const filePath = req.file.path;
        console.log("filepath is " + filePath);
        try {
            csvProcessor.processCsv(filePath);
        } catch(err) {
            console.error("failed to process CSV file", err.message);
            res.status(500).json({ success: false, message: "Failed to proccess the CSV file", file: req.file });
        };
        res.json({ success: true, message: 'File uploaded successfully', file: req.file });
    } else {
        res.status(400).json({ success: false, message: 'No file uploaded' });
    }
};

module.exports = {
    upload,
    handleFileUpload
};