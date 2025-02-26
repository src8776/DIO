const express = require('express');
const db = require('../config/db');
const Attendance = require('../models/Attendance');
const router = express.Router();

router.get('/allDetails', async (req, res) => {
    console.log('Received request at /allDetails');

    let memberID = parseInt(req.query.memberID, 10);
    let organizationID = parseInt(req.query.organizationID, 10);

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
                            'Hours', a.Hours,
                            'CheckInTime', a.CheckInTime,
                            'EventType', et.EventType
                        )
                    ) 
                    FROM Attendance a
                    LEFT JOIN EventInstances ei ON a.EventID = ei.EventID
                    LEFT JOIN EventTypes et ON ei.EventTypeID = et.EventTypeID
                    WHERE a.MemberID = m.MemberID AND a.OrganizationID = ?
                ) AS attendanceRecords
            FROM Members m
            WHERE m.MemberID = ?;
        `;
        console.log('Executing query:', query);
        const [rows] = await db.query(query, [organizationID, memberID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/name', async (req, res) => {
    console.log('Received request at /name');

    let memberID = parseInt(req.query.memberID, 10);

    if (isNaN(memberID)) {
        return res.status(400).json({ error: 'Invalid memberID parameter' });
    }

    try {
        const query = `
            SELECT CONCAT(m.FirstName, ' ', m.LastName) AS fullName
            FROM Members m
            WHERE m.MemberID = ?;
        `;
        const [rows] = await db.query(query, [memberID]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ fullName: rows[0].fullName });
    } catch (error) {
        console.error('Error fetching member name:', error);
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
        const rows = await Attendance.getAttendanceByMemberAndOrg(memberID, organizationID);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;