const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/datatable', async (req, res) => {
    console.log('Received request at /admin/datatable');

    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer

    try {
        const query = `
            SELECT
                Members.MemberID,
                CASE
                    WHEN Members.IsActive = 0 THEN 'Active'
                    ELSE 'Inactive'
                END AS Status,
                Members.FullName,
                COUNT(Attendance.MemberID) AS AttendanceRecord,
                MAX(Attendance.LastUpdated) AS LastUpdated
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
                WHERE Attendance.OrganizationID = ?
            GROUP BY
                Members.MemberID,
                Members.FullName,
                Members.IsActive;
        `;
        const [rows] = await db.query(query, [organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
