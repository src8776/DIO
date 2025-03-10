const express = require('express');
const db = require('../config/db');
const EventRule = require('../models/EventRule');
const router = express.Router();

router.get('/eventRules', async (req, res) => {
    const { organizationID, semesterID } = req.query;
    if (!organizationID || !semesterID) {
        return res.status(400).json({ error: 'Missing organizationID or semesterID' });
    }
    try {
        const eventTypes = await EventRule.getEventRulesByOrgAndSemester(organizationID, semesterID);
        res.json({ eventTypes });
    } catch (error) {
        console.error('Error fetching event rules:', error);
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
    const { orgID, eventTypeID, semesterID, criteria, criteriaValue, pointValue } = req.body;

    try {
        await db.query(
            `INSERT INTO EventRules (OrganizationID, EventTypeID, SemesterID, Criteria, CriteriaValue, PointValue) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [orgID, eventTypeID, semesterID, criteria, criteriaValue, pointValue]
        );
        res.json({ message: 'Rule added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.put('/updateOccurrences', async (req, res) => {
    console.log('Received request at /updateOccurrences (PUT)');

    const { eventTypeID, occurrences, semesterID } = req.body;

    if (!eventTypeID || occurrences === undefined || !semesterID) {
        return res.status(400).json({ error: 'Missing eventTypeID, occurrences, or semesterID parameter' });
    }

    try {
        const query = `
            UPDATE EventTypes
            SET OccurrenceTotal = ?
            WHERE EventTypeID = ? AND SemesterID = ?
        `;
        const [result] = await db.query(query, [occurrences, eventTypeID, semesterID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'EventTypeID or SemesterID not found' });
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


router.post('/copyRules', async (req, res) => {
    const { organizationID, sourceSemesterID, targetSemesterID } = req.body;

    // Validate input
    if (!organizationID || !sourceSemesterID || !targetSemesterID) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    let connection;
    try {
        // Get a connection from the pool
        connection = await db.getConnection();

        // Start a transaction for data consistency
        await connection.beginTransaction();

        // Copy active requirement from OrganizationSettings
        const [activeReq] = await connection.query(
            'SELECT ActiveRequirement, Description FROM OrganizationSettings WHERE OrganizationID = ? AND SemesterID = ?',
            [organizationID, sourceSemesterID]
        );
        if (activeReq.length > 0) {
            await connection.query(
                `INSERT INTO OrganizationSettings (OrganizationID, SemesterID, ActiveRequirement, Description) 
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE ActiveRequirement = VALUES(ActiveRequirement), Description = VALUES(Description)`,
                [organizationID, targetSemesterID, activeReq[0].ActiveRequirement, activeReq[0].Description]
            );
        }

        // Copy rules from EventRules
        const [rules] = await connection.query(
            'SELECT EventTypeID, Criteria, COALESCE(CriteriaValue, 0) AS CriteriaValue, PointValue FROM EventRules WHERE OrganizationID = ? AND SemesterID = ?',
            [organizationID, sourceSemesterID]
        );
        for (const rule of rules) {
            await connection.query(
                `INSERT INTO EventRules (OrganizationID, EventTypeID, SemesterID, Criteria, CriteriaValue, PointValue) 
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE Criteria = VALUES(Criteria), CriteriaValue = VALUES(CriteriaValue), PointValue = VALUES(PointValue)`,
                [organizationID, rule.EventTypeID, targetSemesterID, rule.Criteria, rule.CriteriaValue, rule.PointValue]
            );
        }

        // Commit the transaction
        await connection.commit();
        res.json({ success: true, message: 'Rules copied successfully' });
    } catch (error) {
        // Roll back on error
        if (connection) await connection.rollback();
        console.error('Error copying rules:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;