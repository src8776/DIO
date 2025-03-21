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
    const eventType = req.body.eventType;
    const orgID = req.body.orgID;
    const customEventTitle = req.body.eventTitle;
    const assignDate = req.body.assignDate === 'true';
    const skipMissing = req.body.skipMissing === 'true';
    console.log("Filepath is " + filePath);
    console.log("eventType is " + eventType);
    console.log("orgID is " + orgID);
    console.log("customEventTitle is " + customEventTitle);
    console.log("assignDate is " + assignDate);
    console.log("skipMissing is " + skipMissing);

    try {
        await csvProcessor.processCsv(filePath, eventType, orgID, customEventTitle, assignDate, skipMissing);
        return res.json({
            success: true,
            message: 'File uploaded and processed successfully',
            file: req.file
        });
    } catch (error) {
        console.error('Error processing CSV:', error);
        if (error.type === 'single_date_missing') {
            res.json({
                status: 'single_date_missing',
                missingCount: error.missingCount,
                eventDate: error.eventDate
            });
        } else if (error.type === 'multiple_dates_missing') {
            res.json({
                status: 'multiple_dates_missing',
                missingCount: error.missingCount
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'An error occurred while processing the CSV file',
                error: error.message,
                file: req.file
            });
        }
    }
};

module.exports = {
    upload,
    handleFileUpload
};