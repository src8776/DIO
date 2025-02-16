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

const handleFileUpload = async (req, res) => {
    console.log("invoke /upload");

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'File is missing'
        });
    }

    const filePath = req.file.path;
    console.log("Filepath is " + filePath);
    const eventType = req.body.eventType;
    console.log("eventType is " + eventType);
    const orgID = req.body.orgID;
    console.log("orgID is " + orgID);

    try {
        await csvProcessor.processCsv(filePath, eventType, orgID);
        return res.json({
            success: true,
            message: 'File uploaded and processed successfully',
            file: req.file
        });
    } catch (error) {
        console.error('Error processing CSV:', error);

        return res.status(400).json({
            success: false,
            message: 'An error occurred while processing the CSV file',
            error: error.message,
            file: req.file
        });
    }
};

module.exports = {
    upload,
    handleFileUpload
};