const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
    console.log('Received request at /events');

    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer

    if (isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid organizationID parameter' });
    }

    try {
        const query = `
            SELECT 
                EventType, EventTypeID
            FROM 
                EventTypes
            WHERE OrganizationID = ?
        `;
        const [rows] = await db.query(query, [organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Events data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;