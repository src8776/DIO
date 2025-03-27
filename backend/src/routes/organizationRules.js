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


router.put('/updateMaxPoints', async (req, res) => {
    console.log('Received request at /updateMaxPoints (PUT)');

    const { eventTypeID, maxPoints } = req.body;

    if (!eventTypeID || maxPoints === undefined) {
        return res.status(400).json({ error: 'Missing eventTypeID or maxPoints parameter' });
    }

    try {
        const query = `
            UPDATE EventTypes 
            SET MaxPoints = ? 
            WHERE EventTypeID = ?
        `;
        const [result] = await db.query(query, [maxPoints, eventTypeID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'EventTypeID not found' });
        }

        console.log('MaxPoints for EventTypeID: ', eventTypeID, ' updated to: ', maxPoints);
        res.json({ success: true, message: 'MaxPoints updated successfully' });
    } catch (error) {
        console.error('Error updating MaxPoints:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/addEventType', async (req, res) => {
    console.log('Received POST to /api/events/addEventType:', req.body);
    const { organizationID, EventTypeName, TrackingType, occurrences, semesterID } = req.body;

    if (!organizationID || !EventTypeName || !TrackingType || !occurrences || !semesterID) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // Check if an event type with the same name already exists in this semester
        const checkQuery = `
            SELECT 
                EventTypeID 
            FROM 
                EventTypes 
            WHERE 
                OrganizationID = ? AND EventType = ? AND SemesterID = ?
        `;
        const [existingEventTypes] = await db.query(checkQuery, [organizationID, EventTypeName, semesterID]);

        if (existingEventTypes.length > 0) {
            return res.status(400).json({ error: 'Event type with the same name already exists in this semester' });
        }

        // Insert the new event type with SemesterID
        const insertQuery = `
            INSERT INTO EventTypes (OrganizationID, EventType, RuleType, OccurrenceTotal, SemesterID)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.query(insertQuery, [organizationID, EventTypeName, TrackingType, occurrences, semesterID]);
        res.status(201).json({ message: 'Event type added successfully' });
    } catch (error) {
        console.error('Error adding event type:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/deleteEventType', async (req, res) => {
    // TODO: Notify the user if there are attendance records associated with this event type
    // prompt them to confirm deletion! 
    console.log('Received request at /deleteEventType (DELETE)');

    const { eventTypeID } = req.body;
    if (!eventTypeID) {
        return res.status(400).json({ error: 'Missing eventTypeID parameter' });
    }

    try {
        // Get event IDs associated with this eventTypeID (assuming an Events table exists)
        const [eventRows] = await db.query(
            `SELECT EventID FROM Events WHERE EventTypeID = ?`,
            [eventTypeID]
        );
        const eventIDs = eventRows.map(row => row.EventID);

        let attendanceCount = 0;
        if (eventIDs.length > 0) {
            // Tally Attendance records for these events
            const [attendanceRows] = await db.query(
                `SELECT COUNT(*) AS count FROM Attendance WHERE EventID IN (?)`,
                [eventIDs]
            );
            attendanceCount = attendanceRows[0].count || 0;

            // Delete Attendance records for these events
            await db.query(
                `DELETE FROM Attendance WHERE EventID IN (?)`,
                [eventIDs]
            );

            // Delete events for this event type
            await db.query(
                `DELETE FROM Events WHERE EventTypeID = ?`,
                [eventTypeID]
            );
        }

        // Delete all EventRules associated with the eventTypeID
        await db.query(
            `DELETE FROM EventRules WHERE EventTypeID = ?`,
            [eventTypeID]
        );

        // Delete the EventTypes record for the given eventTypeID
        const [result] = await db.query(
            `DELETE FROM EventTypes WHERE EventTypeID = ?`,
            [eventTypeID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'EventTypeID not found' });
        }

        res.json({
            success: true,
            message: 'Event type, associated events, attendance, and rules deleted successfully',
            attendanceCount
        });
    } catch (error) {
        console.error('Error deleting event type and associated records:', error);
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

        // Delete existing rules for the target semester
        await connection.query(
            'DELETE FROM EventRules WHERE OrganizationID = ? AND SemesterID = ?',
            [organizationID, targetSemesterID]
        );

        // Copy event types from source semester to target semester
        const [eventTypes] = await connection.query(
            `SELECT EventType, RuleType, MaxPoints, MinPoints, OccurrenceTotal 
             FROM EventTypes 
             WHERE OrganizationID = ? AND SemesterID = ?`,
            [organizationID, sourceSemesterID]
        );

        // Keep track of old to new EventTypeID mappings
        const eventTypeIdMap = {};

        // Insert event types for target semester and store mapping
        for (const et of eventTypes) {
            const [result] = await connection.query(
                `INSERT INTO EventTypes 
                (OrganizationID, EventType, RuleType, MaxPoints, MinPoints, OccurrenceTotal, SemesterID)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [organizationID, et.EventType, et.RuleType, et.MaxPoints, et.MinPoints, et.OccurrenceTotal, targetSemesterID]
            );

            // Store mapping from source event type name to new ID
            eventTypeIdMap[et.EventType] = result.insertId;
        }

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

        // Copy rules from EventRules with updated EventTypeIDs
        const [rules] = await connection.query(
            `SELECT er.EventTypeID, et.EventType, er.Criteria, 
             COALESCE(er.CriteriaValue, 0) AS CriteriaValue, er.PointValue 
             FROM EventRules er
             JOIN EventTypes et ON er.EventTypeID = et.EventTypeID
             WHERE er.OrganizationID = ? AND er.SemesterID = ?`,
            [organizationID, sourceSemesterID]
        );

        for (const rule of rules) {
            // Get new EventTypeID from map
            const newEventTypeId = eventTypeIdMap[rule.EventType];

            if (newEventTypeId) {
                await connection.query(
                    `INSERT INTO EventRules 
                    (OrganizationID, EventTypeID, SemesterID, Criteria, CriteriaValue, PointValue) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [organizationID, newEventTypeId, targetSemesterID, rule.Criteria, rule.CriteriaValue, rule.PointValue]
                );
            }
        }

        // Commit the transaction
        await connection.commit();
        res.json({ success: true, message: 'Rules and event types copied successfully' });
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