const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/OrganizationSetupPage', async (req, res) => {
    console.log('Received request at /OrganizationSetupPage');

    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer
    // console.log(organizationID)

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
            FROM EventTypes et
            LEFT JOIN EventRules er 
                ON et.EventTypeID = er.EventTypeID 
                AND er.OrganizationID = et.OrganizationID
            WHERE et.OrganizationID = ?;
        `;
        const [rows] = await db.query(query, [organizationID]);

        // Transform the flat array into a nested structure
        const eventTypesMap = {};

        rows.forEach(row => {
            const eventTypeID = row.EventTypeID;

            if (!eventTypesMap[eventTypeID]) {
                eventTypesMap[eventTypeID] = {
                    eventTypeID: row.eventTypeID,
                    name: row.EventType,
                    ruleType: row.RuleType,
                    OccurrenceTotal: row.OccurrenceTotal,
                    rules: []
                };
            }

            if (row.RuleID) { // Only add rules if they exist
                eventTypesMap[eventTypeID].rules.push({
                    criteria: row.Criteria,
                    criteriaValue: parseFloat(row.CriteriaValue),
                    pointValue: parseFloat(row.PointValue),
                    ruleID:row.RuleID 
                });
            }
        });

        // Convert the object map to an array
        const formattedResponse = Object.values(eventTypesMap);

        res.json({ eventTypes: formattedResponse });
    } catch (error) {
        console.error('Error fetching data for Organization Setup Page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.put('/updateRule', async (req, res) => {
    console.log('Received request at /updateRule (PUT)');

    const { ruleID, criteriaValue, pointValue } = req.body;

    if (!ruleID || criteriaValue === undefined || pointValue === undefined) {
        return res.status(400).json({ error: 'Missing ruleID, criteriaValue, or pointValue parameter' });
    }

    try {
        const query = `
            UPDATE EventRules
            SET CriteriaValue = ?, PointValue = ?
            WHERE RuleID = ?
        `;
        const [result] = await db.query(query, [criteriaValue, pointValue, ruleID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'RuleID not found' });
        }

        res.json({ success: true, message: 'Rule updated successfully' });
    } catch (error) {
        console.error('Error updating rule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;