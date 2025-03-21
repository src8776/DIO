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

/** Multer instance for file uploads */
const upload = multer({ storage });

// Ensure tmp directory exists
if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
}

/**
 * Handles file upload and processes CSV data.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
const handleFileUpload = async (req, res) => {
    console.log('invoke /upload');

    // Validate file presence
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

    console.log(`Filepath: ${filePath}, eventType: ${eventType}, orgID: ${orgID}, customEventTitle: ${customEventTitle}, assignDate: ${assignDate}, skipMissing: ${skipMissing}`);

    try {
        // Process CSV file
        await csvProcessor.processCsv(filePath, eventType, orgID, customEventTitle, assignDate, skipMissing);
        res.json({
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
            res.status(400).json({
                success: false,
                message: 'An error occurred while processing the CSV file',
                error: error.message,
                file: req.file
            });
        }
    }
};

module.exports = { upload, handleFileUpload };