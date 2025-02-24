const express = require('express');
const db = require('../config/db');
const EventRule = require('../models/EventRule');
const router = express.Router();

router.get('/eventRules', async (req, res) => {
    console.log('Received request at /eventRules');

    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer
    // console.log(organizationID)

    if (isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid organizationID parameter' });
    }

    try {
        // Convert the object map to an array
        const formattedResponse = await EventRule.getEventRulesByOrg(organizationID);

        res.json({ eventTypes: formattedResponse });
    } catch (error) {
        console.error('Error fetching data for Organization Setup Page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.put('/updateRule', async (req, res) => {
    console.log('Received request at /updateRule (PUT)');

    const { ruleID, criteriaType, criteriaValue, pointValue } = req.body;

    if (!ruleID || !criteriaType || criteriaValue === undefined || pointValue === undefined) {
        return res.status(400).json({ error: 'Missing ruleID, criteriaType, criteriaValue, or pointValue parameter' });
    }

    try {
        const query = `
            UPDATE EventRules
            SET Criteria = ?, CriteriaValue = ?, PointValue = ?
            WHERE RuleID = ?
        `;
        const [result] = await db.query(query, [criteriaType, criteriaValue, pointValue, ruleID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'RuleID not found' });
        }

        res.json({ success: true, message: 'Rule updated successfully' });
    } catch (error) {
        console.error('Error updating rule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.put('/updateOccurrences', async (req, res) => {
    console.log('Received request at /updateOccurrences (PUT)');

    const { eventTypeID, occurrences } = req.body;

    if (!eventTypeID || occurrences === undefined) {
        return res.status(400).json({ error: 'Missing eventTypeID or occurrences parameter' });
    }

    try {
        const query = `
            UPDATE EventTypes
            SET OccurrenceTotal = ?
            WHERE EventTypeID = ?
        `;
        const [result] = await db.query(query, [occurrences, eventTypeID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'EventTypeID not found' });
        }

        res.json({ success: true, message: 'Occurrences updated successfully' });
    } catch (error) {
        console.error('Error updating occurrences:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;