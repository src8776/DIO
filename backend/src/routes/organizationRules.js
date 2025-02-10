const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/OrganizationSetupPage', async (req, res) => {
    console.log('Received request at /OrganizationSetupPage');
    try {
        const query = `
            SELECT 
                pr.RuleID, 
                pr.OrganizationID, 
                o.Name,
                o.ActiveRequirement,
                pr.EventType, 
                pr.TrackingType,
                p.RequirementID, 
                p.PointsPer, 
                p.MinRequirement,
                p.Description
            FROM 
                PointRules pr
            LEFT JOIN 
                PointsRequirements p 
            ON 
                pr.RuleID = p.RuleID
            LEFT JOIN 
                Organizations o 
            ON 
                pr.OrganizationID = o.OrganizationID;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching data for Organization Setup Page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;