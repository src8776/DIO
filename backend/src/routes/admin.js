const express = require('express');
const db = require('../config/db');

const router = express.Router();

const requireAuth = async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    next();
}

router.get('/datatableAllTerms', requireAuth, async (req, res) => {
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


router.get('/datatableByTerm', requireAuth, async (req, res) => {
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


router.get('/getSemesters', requireAuth, async (req, res) => {
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

router.get('/getOfficersAndAdmin', requireAuth, async (req, res) => {
    console.log('Received request at /admin/getOfficersAndAdmin');
    let organizationID = parseInt(req.query.organizationID, 10);

    try {
        const query = `
            SELECT DISTINCT
                m.MemberID,
                m.FullName,
                m.Email,
                r.RoleName
            FROM
                Members m
            JOIN OrganizationMembers om ON om.MemberID = m.MemberID
            JOIN Roles r ON om.RoleID = r.RoleID
            WHERE
                om.OrganizationID = ?
                AND om.RoleID IN (1, 3);
        `;
        const [rows] = await db.query(query, [organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// PROTECT THIS ENDPOINT WITH AUTHENTICATION MIDDLEWARE
router.post('/setOfficer', requireAuth, async (req, res) => {
    console.log('Received request at /admin/setOfficer');
    let organizationID = parseInt(req.query.organizationID, 10);
    let memberID = parseInt(req.query.memberID, 10);

    try {
        const query = `
            UPDATE OrganizationMembers
            SET RoleID = 3
            WHERE MemberID = ?
            AND OrganizationID = ?;
        `;
        const [rows] = await db.query(query, [memberID, organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PROTECT THIS ENDPOINT WITH AUTHENTICATION MIDDLEWARE
router.post('/setAdmin', requireAuth, async (req, res) => {
    console.log('Received request at /admin/setAdmin');
    let organizationID = parseInt(req.query.organizationID, 10);
    let memberID = parseInt(req.query.memberID, 10);

    try {
        const query = `
            UPDATE OrganizationMembers
            SET RoleID = 1
            WHERE MemberID = ?
            AND OrganizationID = ?;
        `;
        const [rows] = await db.query(query, [memberID, organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// used to remove admin/officer role
router.post('/setMember', requireAuth, async (req, res) => {
    console.log('Received request at /admin/setMember');
    let organizationID = parseInt(req.query.organizationID, 10);
    let memberID = parseInt(req.query.memberID, 10);

    try {
        const query = `
            UPDATE OrganizationMembers
            SET RoleID = 2
            WHERE MemberID = ?
            AND OrganizationID = ?;
        `;
        const [rows] = await db.query(query, [memberID, organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;