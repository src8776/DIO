const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleFileUpload } = require('../upload/handleFileUpload');

const upload = multer({ dest: 'tmp/' });

router.post('/upload-volunteer-hours', upload.single('csvFile'), handleFileUpload);

module.exports = router;
