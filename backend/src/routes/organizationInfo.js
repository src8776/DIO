const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/name', async (req, res) => {
    console.log('Received request at /OrganizationInfo/name');

    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer

    if (isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid organizationID parameter' });
    }

    try {
        const query = `
            SELECT 
                Name
            FROM 
                Organizations
            WHERE OrganizationID = ?
        `;
        const [rows] = await db.query(query, [organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/activeRequirement', async (req, res) => {
    console.log('Received request at /OrganizationInfo/activeRequirement');

    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer

    if (isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid organizationID parameter' });
    }

    try {
        const query = `
            SELECT 
                ActiveRequirement
            FROM 
                OrganizationSettings
            WHERE OrganizationID = ?
        `;
        const [rows] = await db.query(query, [organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;