const express = require('express');
const cors = require('cors');
const db = require('./config/db.js');

const app = express();
app.use(cors());
app.use(express.json());

// endpoint to fetch data for the table
app.get('/datatable', async (req, res) => {
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
        const [rows] = await db.query(query); // use query constant above
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});