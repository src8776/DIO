const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    console.log('Received request at /api/admin/report');
    const data = req.body;
    console.log(data);
});

module.exports = router;