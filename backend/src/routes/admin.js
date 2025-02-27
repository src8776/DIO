const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/datatable', async (req, res) => {
    console.log('Received request at /admin/datatable');

    let organizationID = parseInt(req.query.organizationID, 10);

    try {
        const query = `
            SELECT
                Members.MemberID,
                OrganizationMembers.Status,
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
                           AND Attendance.OrganizationID = ?
            LEFT JOIN
                Roles ON OrganizationMembers.RoleID = Roles.RoleID
            WHERE
                OrganizationMembers.OrganizationID = ?
            GROUP BY
                Members.MemberID,
                Members.FullName,
                OrganizationMembers.Status;
        `;
        const [rows] = await db.query(query, [organizationID, organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;