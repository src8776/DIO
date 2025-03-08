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


router.delete('/deleteRule', async (req, res) => {
    console.log('Received request at /deleteRule (DELETE)');

    const { ruleID } = req.body;

    if (!ruleID) {
        return res.status(400).json({ error: 'Missing ruleID parameter' });
    }

    try {
        const query = `
            DELETE FROM EventRules
            WHERE RuleID = ?
        `;
        const [result] = await db.query(query, [ruleID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'RuleID not found' });
        }

        res.json({ success: true, message: 'Rule deleted successfully' });
    } catch (error) {
        console.error('Error deleting rule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/addRule', async (req, res) => {
    console.log('Received POST to /addRule:', req.body);
    const { orgID, eventTypeID, criteria, criteriaValue, pointValue } = req.body;

    if (!orgID || !eventTypeID || !criteria || criteriaValue === undefined || pointValue === undefined) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const insertQuery = `
            INSERT INTO EventRules (OrganizationID, EventTypeID, Criteria, CriteriaValue, PointValue)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.query(insertQuery, [orgID, eventTypeID, criteria, criteriaValue, pointValue]);
        res.status(201).json({ message: 'Rule added successfully' });
    } catch (error) {
        console.error('Error adding rule:', error);
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


router.post('/addEventType', async (req, res) => {
    console.log('Received POST to /api/events/addEventType:', req.body);
    const { organizationID, EventTypeName, TrackingType, occurrences } = req.body;

    if (!organizationID || !EventTypeName || !TrackingType || !occurrences) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // Check if an event type with the same name already exists
        const checkQuery = `
            SELECT 
                EventTypeID 
            FROM 
                EventTypes 
            WHERE 
                OrganizationID = ? AND EventType = ?
        `;
        const [existingEventTypes] = await db.query(checkQuery, [organizationID, EventTypeName]);

        if (existingEventTypes.length > 0) {
            return res.status(400).json({ error: 'Event type with the same name already exists' });
        }

        // Insert the new event type
        const insertQuery = `
            INSERT INTO EventTypes (OrganizationID, EventType, RuleType, OccurrenceTotal)
            VALUES (?, ?, ?, ?)
        `;
        await db.query(insertQuery, [organizationID, EventTypeName, TrackingType, occurrences]);
        res.status(201).json({ message: 'Event type added successfully' });
    } catch (error) {
        console.error('Error adding event type:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;