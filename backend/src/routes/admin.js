const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/datatable', async (req, res) => {
    console.log('Received request at /admin/datatable');
    try {
        const query = `
            SELECT
                Members.MemberID,
                CASE
                    WHEN Members.IsActive = 0 THEN 'Active'
                    ELSE 'Inactive'
                END AS Status,
                Members.FullName,
                COUNT(Attendance.MemberID) AS AttendanceRecord
            FROM
                Members
            JOIN
                OrganizationMembers ON Members.MemberID = OrganizationMembers.MemberID
            JOIN
                Organizations ON OrganizationMembers.OrganizationID = Organizations.OrganizationID
            LEFT JOIN
                Attendance ON Members.MemberID = Attendance.MemberID
            LEFT JOIN
                Roles ON OrganizationMembers.RoleID = Roles.RoleID
            GROUP BY
                Members.MemberID,
                Members.FullName,
                Members.IsActive;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// get all members in an organization by status
router.get('/:org/members/:status', async (req, res) => {
    // status will be -1 for all members, 0 for active, and 1 for inactive
    const {org, status} = req.params;

    try {
        let query = ``;

        const queryParams = [org];

        // apply status search if needed 
        if (status !== '-1') {
            query += ` `;
            queryParams.push(status);
        }

        const [rows] = await db.query(query, queryParams);

        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// get all memberst that have the admin role
router.get('/:org/officers', async (req, res) => {
    const {org} = req.params;

    try {
        const query = ``;

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
