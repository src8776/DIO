const express = require('express');
const db = require('../config/db');
const OrganizationSetting = require('../models/OrganizationSetting');
const router = express.Router();


router.get('/allOrganizationIDs', async (req, res) => {
    console.log('Received request at /OrganizationInfo/allOrganizationIDs');

    try {
        const query = `
            SELECT 
                OrganizationID
            FROM 
                Organizations
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all OrganizationIDs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/organizationIDByAbbreviation', async (req, res) => {
    console.log('Received request at /OrganizationInfo/organizationIDByAbbreviation');

    let abbreviation = req.query.abbreviation;

    if (!abbreviation) {
        return res.status(400).json({ error: 'Missing abbreviation parameter' });
    }

    try {
        const query = `
            SELECT 
                OrganizationID
            FROM 
                Organizations
            WHERE Abbreviation = ?
        `;
        const [rows] = await db.query(query, [abbreviation]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching OrganizationID by Abbreviation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


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


// endpoint to insert a new ActiveRequirement value
router.post('/updateActiveRequirement', async (req, res) => {
    console.log('Received request at /OrganizationInfo/updateActiveRequirement (POST)');
    const { organizationID, activeRequirement, requirementType } = req.body;
    
    if (!organizationID || (!activeRequirement && !requirementType)) {
        return res.status(400).json({ error: 'Missing organizationID or activeRequirement/requirementType parameter' });
    }

    console.log('Updating ActiveRequirement and/or requirementType:', { organizationID, activeRequirement, requirementType });

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
            if (activeRequirement) {
                const updateRequirementQuery = `
                    UPDATE OrganizationSettings
                    SET ActiveRequirement = ?
                    WHERE OrganizationID = ?
                `;
                await db.query(updateRequirementQuery, [activeRequirement, organizationID]);
            }
            if (requirementType) {
                const updateRequirementTypeQuery = `
                    UPDATE OrganizationSettings
                    SET Description = ?
                    WHERE OrganizationID = ?
                `;
                await db.query(updateRequirementTypeQuery, [requirementType, organizationID]);
            }
            res.json({ success: true, message: 'ActiveRequirement and/or requirementType value updated successfully' });
        } else {
            // Record does not exist, insert it
            const insertQuery = `
                INSERT INTO OrganizationSettings (OrganizationID, ActiveRequirement, requirementType)
                VALUES (?, ?, ?)
            `;
            await db.query(insertQuery, [organizationID, activeRequirement || null, requirementType || null]);
            res.json({ success: true, message: 'ActiveRequirement and/or requirementType value inserted successfully' });
        }
    } catch (error) {
        console.error('Error updating ActiveRequirement and/or requirementType:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;