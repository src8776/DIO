const express = require('express');
const db = require('../config/db');
const OrganizationSetting = require('../models/OrganizationSetting');
const router = express.Router();

if (process.env.NODE_ENV === "production") {
    const requireAuth = async (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        next();
    }
    router.use(requireAuth);
}

router.get('/allOrganizationIDs', async (req, res) => {
    console.log('Received request at /organizationInfo/allOrganizationIDs');

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


router.get('/organizationIDsByMemberID', async (req, res) => {
    console.log('Received request at /organizationInfo/organizationIDsByMemberID');

    let memberID = parseInt(req.query.memberID, 10);

    if (isNaN(memberID)) {
        return res.status(400).json({ error: 'Invalid memberID parameter' });
    }

    try {
        // Check if the member has RoleID of 1
        const roleQuery = `
            SELECT RoleID
            FROM OrganizationMembers
            WHERE MemberID = ? AND RoleID = 1
            LIMIT 1
        `;
        const [roleRows] = await db.query(roleQuery, [memberID]);

        let resultQuery;
        let params;
        if (roleRows.length > 0) {
            // Member is admin, return all distinct OrganizationIDs
            resultQuery = `
                SELECT DISTINCT OrganizationID
                FROM OrganizationMembers
            `;
            params = [];
        } else {
            // Return OrganizationIDs for the member only
            resultQuery = `
                SELECT DISTINCT OrganizationID
                FROM OrganizationMembers
                WHERE MemberID = ?
            `;
            params = [memberID];
        }

        const [rows] = await db.query(resultQuery, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching OrganizationIDs by MemberID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/organizationIDByAbbreviation', async (req, res) => {
    console.log('Received request at /organizationInfo/organizationIDByAbbreviation');

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


router.get('/abbreviationByOrganizationID', async (req, res) => {
    console.log('Received request at /organizationInfo/abbreviationByOrganizationID');

    let organizationID = parseInt(req.query.organizationID, 10);

    if (isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid organizationID parameter' });
    }

    try {
        const query = `
            SELECT 
                Abbreviation
            FROM 
                Organizations
            WHERE OrganizationID = ?
        `;
        const [rows] = await db.query(query, [organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Abbreviation by OrganizationID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/name', async (req, res) => {
    console.log('Received request at /organizationInfo/name');

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
    const { organizationID, semesterID } = req.query;
    try {
        const [rows] = await db.query(
            `SELECT ActiveRequirement, Description 
            FROM OrganizationSettings 
            WHERE OrganizationID = ? AND SemesterID = ?
            `,
            [organizationID, semesterID]
        );
        res.json(rows.length > 0 ? rows : [{ ActiveRequirement: null, Description: null }]);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/updateActiveRequirement', async (req, res) => {
    const { organizationID, semesterID, activeRequirement, requirementType } = req.body;
    try {
        await db.query(`
            INSERT INTO OrganizationSettings (OrganizationID, SemesterID, ActiveRequirement, Description) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE ActiveRequirement = VALUES(ActiveRequirement), Description = VALUES(Description)
            `,
            [organizationID, semesterID, activeRequirement, requirementType]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;