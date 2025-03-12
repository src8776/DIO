const express = require('express');
const db = require('../config/db');
const router = express.Router();


router.get('/memberTallies', async (req, res) => {
    const { organizationID, semesterID } = req.query;

    try {
        const [rows] = await db.query(
            `SELECT 
                COUNT(*) AS totalMembers,
                SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS activeMembers,
                SUM(CASE WHEN Status = 'Inactive' THEN 1 ELSE 0 END) AS inactiveMembers
            FROM OrganizationMembers
            WHERE OrganizationID = ? AND SemesterID = ?`,
            [organizationID, semesterID]
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/averageAttendance', async (req, res) => {
    const { organizationID, semesterID } = req.query;

    if (!organizationID || !semesterID) {
        return res.status(400).json({ error: 'Missing organizationID or semesterID' });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                EventType,
                AVG(attendance_rate) AS averageAttendanceRate
            FROM (
                SELECT 
                    ei.EventID,
                    et.EventType,
                    COALESCE(COUNT(CASE WHEN a.AttendanceStatus = 'Attended' THEN 1 END), 0) / 
                    GREATEST((SELECT COUNT(*) FROM OrganizationMembers WHERE OrganizationID = ? AND SemesterID = ?), 1) AS attendance_rate
                FROM EventInstances ei
                JOIN EventTypes et ON ei.EventTypeID = et.EventTypeID
                JOIN Attendance a ON ei.EventID = a.EventID
                JOIN Semesters s ON ei.TermCode = s.TermCode
                WHERE ei.OrganizationID = ? AND s.SemesterID = ?
                GROUP BY ei.EventID, et.EventType
            ) AS event_rates
            GROUP BY EventType`,
            [organizationID, semesterID, organizationID, semesterID]
        );
        res.json(rows);
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/overallAttendance', async (req, res) => {
    const { organizationID, semesterID } = req.query;

    if (!organizationID || !semesterID) {
        return res.status(400).json({ error: 'Missing organizationID or semesterID' });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                AVG(attendance_rate) AS overallAttendanceRate
            FROM (
                SELECT 
                    ei.EventID,
                    COALESCE(COUNT(CASE WHEN a.AttendanceStatus = 'Attended' THEN 1 END), 0) / 
                    GREATEST((SELECT COUNT(*) FROM OrganizationMembers WHERE OrganizationID = ? AND SemesterID = ?), 1) AS attendance_rate
                FROM EventInstances ei
                JOIN Attendance a ON ei.EventID = a.EventID
                JOIN Semesters s ON ei.TermCode = s.TermCode
                WHERE ei.OrganizationID = ? AND s.SemesterID = ?
                GROUP BY ei.EventID
            ) AS event_rates`,
            [organizationID, semesterID, organizationID, semesterID]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/membersByMajor', async (req, res) => {
    const { organizationID, semesterID } = req.query;

    if (!organizationID || !semesterID) {
        return res.status(400).json({ error: 'Missing organizationID or semesterID' });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                COALESCE(m.Title, 'No Major') AS major,
                c.Name AS college,
                COUNT(om.MemberID) AS memberCount
            FROM OrganizationMembers om
            JOIN Members mem ON om.MemberID = mem.MemberID
            LEFT JOIN Majors m ON mem.MajorID = m.MajorID
            LEFT JOIN Colleges c ON m.CollegeID = c.CollegeID
            WHERE om.OrganizationID = ? AND om.SemesterID = ?
            GROUP BY m.Title, c.Name
            ORDER BY memberCount DESC`,
            [organizationID, semesterID]
        );
        res.json(rows);
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;