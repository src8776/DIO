const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/datatableAllTerms', async (req, res) => {
    console.log('Received request at /admin/datatableAllTerms');

    let organizationID = parseInt(req.query.organizationID, 10);

    try {
        const query = `
            SELECT
                Members.MemberID,
                Members.FullName,
                'N/A' AS Status,
                (
                    SELECT COUNT(*)
                    FROM Attendance
                    WHERE Attendance.MemberID = Members.MemberID
                    AND Attendance.OrganizationID = ?
                ) AS AttendanceRecord,
                (
                    SELECT MAX(Attendance.LastUpdated)
                    FROM Attendance
                    WHERE Attendance.MemberID = Members.MemberID
                    AND Attendance.OrganizationID = ?
                ) AS LastUpdated
            FROM
                Members
            WHERE
                EXISTS (
                    SELECT 1
                    FROM OrganizationMembers
                    WHERE OrganizationMembers.MemberID = Members.MemberID
                    AND OrganizationMembers.OrganizationID = ?
                )
            GROUP BY
                Members.MemberID,
                Members.FullName;
        `;
        const [rows] = await db.query(query, [organizationID, organizationID, organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/datatableByTerm', async (req, res) => {
    console.log('Received request at /admin/datatableByTerm');

    let termCode = req.query.termCode;
    let organizationID = parseInt(req.query.organizationID, 10);

    try {
        const query = `
            SELECT
                Members.MemberID,
                OrganizationMembers.Status,
                Members.FullName,
                (
                    SELECT COUNT(*)
                    FROM Attendance
                    JOIN EventInstances ON Attendance.EventID = EventInstances.EventID
                    WHERE Attendance.MemberID = Members.MemberID
                    AND Attendance.OrganizationID = ?
                    AND EventInstances.TermCode = ?
                ) AS AttendanceRecord,
                (
                    SELECT MAX(Attendance.LastUpdated)
                    FROM Attendance
                    JOIN EventInstances ON Attendance.EventID = EventInstances.EventID
                    WHERE Attendance.MemberID = Members.MemberID
                    AND Attendance.OrganizationID = ?
                    AND EventInstances.TermCode = ?
                ) AS LastUpdated
            FROM
                Members
            JOIN
                OrganizationMembers ON Members.MemberID = OrganizationMembers.MemberID
            JOIN
                Semesters ON OrganizationMembers.SemesterID = Semesters.SemesterID
            WHERE
                OrganizationMembers.OrganizationID = ?
                AND Semesters.TermCode = ?;
        `;
        const [rows] = await db.query(query, [organizationID, termCode, organizationID, termCode, organizationID, termCode]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/getSemesters', async (req, res) => {
    console.log('Received request at /admin/getSemesters');

    try {
        const query = `
            SELECT
                *
            FROM
                Semesters;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;