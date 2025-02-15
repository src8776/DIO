const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/OrganizationSetupPage', async (req, res) => {
    console.log('Received request at /OrganizationSetupPage');

    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer
    console.log(organizationID)

    if (isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid organizationID parameter' });
    }

    try {
        const query = `
            SELECT 
                et.EventTypeID,
                et.EventType,
                et.RuleType,
                et.MaxPoints,
                et.MinPoints,
                et.OccurrenceTotal,
                er.RuleID,
                er.Criteria,
                er.CriteriaValue,
                er.PointValue
            FROM eventtypes et
            LEFT JOIN eventrules er 
                ON et.EventTypeID = er.EventTypeID 
                AND er.OrganizationID = et.OrganizationID
            WHERE et.OrganizationID = ?;
        `;
        const [rows] = await db.query(query, [organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching data for Organization Setup Page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;