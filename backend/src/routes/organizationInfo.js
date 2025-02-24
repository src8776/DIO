const express = require('express');
const db = require('../config/db');
const OrganizationSetting = require('../models/OrganizationSetting');
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
        const rows = await OrganizationSetting.getActiveRequirementByOrg(organizationID);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// New endpoint to insert a new ActiveRequirement value
router.post('/updateActiveRequirement', async (req, res) => {
    console.log('Received request at /OrganizationInfo/updateActiveRequirement (POST)');
    const { organizationID, activeRequirement } = req.body;
    
    if (!organizationID || !activeRequirement) {
        return res.status(400).json({ error: 'Missing organizationID or activeRequirement parameter' });
    }

    console.log('Updating ActiveRequirement:', { organizationID, activeRequirement });

    try {
        // Check if the record exists
        const checkQuery = `
            SELECT ConfigID
            FROM OrganizationSettings
            WHERE OrganizationID = ?
        `;
        const [checkResult] = await db.query(checkQuery, [organizationID]);

        if (checkResult.length > 0) {
            // Record exists, update it
            const updateQuery = `
                UPDATE OrganizationSettings
                SET ActiveRequirement = ?
                WHERE OrganizationID = ?
            `;
            await db.query(updateQuery, [activeRequirement, organizationID]);
            res.json({ success: true, message: 'ActiveRequirement value updated successfully' });
        } else {
            // Record does not exist, insert it
            const insertQuery = `
                INSERT INTO OrganizationSettings (OrganizationID, ActiveRequirement)
                VALUES (?, ?)
            `;
            await db.query(insertQuery, [organizationID, activeRequirement]);
            res.json({ success: true, message: 'ActiveRequirement value inserted successfully' });
        }
    } catch (error) {
        console.error('Error updating ActiveRequirement:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;