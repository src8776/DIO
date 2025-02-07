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
                    WHEN Members.IsActive = 1 THEN 'Active'
                    ELSE 'Inactive'
                END AS Status,
                Members.DisplayName,
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
                Members.DisplayName,
                Members.IsActive;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
