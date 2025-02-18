const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/allDetails', async (req, res) => {
    console.log('Received request at /allDetails');

    let memberID = parseInt(req.query.memberID, 10); // Convert to an integer
    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer

    if (isNaN(memberID) || isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid memberID or organizationID parameter' });
    }

    try {
        const query = `
           
            SELECT 
                m.*, 
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'AttendanceID', a.AttendanceID,
                            'MemberID', a.MemberID,
                            'EventID', a.EventID,
                            'CheckInTime', a.CheckInTime
                        )
                    ) 
                    FROM Attendance a 
                    WHERE a.MemberID = m.MemberID AND a.OrganizationID = ?
                ) AS attendanceRecords
            FROM Members m
            WHERE m.MemberID = ?;
        `;
        const [rows] = await db.query(query, [organizationID, memberID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/attendance', async (req, res) => {
    console.log('Received request at /attendance');

    let memberID = parseInt(req.query.memberID, 10); // Convert to an integer
    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer

    if (isNaN(memberID) || isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid memberID or organizationID parameter' });
    }

    try {
        const query = `
            SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'hours', t.Hours,
                        'eventDate', t.EventDate,
                        'eventType', t.EventType
                    )
                ) AS attendanceRecord
            FROM (
                SELECT et.EventType, DATE_FORMAT(ei.EventDate, '%Y-%m-%d') AS EventDate, a.Hours
                FROM Attendance AS a
                JOIN EventInstances AS ei ON a.EventID = ei.EventID
                JOIN EventTypes AS et ON ei.EventTypeID = et.EventTypeID
                WHERE a.OrganizationID = ? 
                AND a.MemberID = ?
                ORDER BY ei.EventDate
            ) AS t;
        `;
        const [rows] = await db.query(query, [organizationID, memberID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;