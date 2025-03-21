const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/names', async (req, res) => {
    console.log('Received request at /api/admin/members/names');

    let organizationID = parseInt(req.query.organizationID, 10); // Convert to an integer

    try {
        const query = `
            SELECT
                m.MemberID,
                m.FullName
            FROM
                Members m
            WHERE
                EXISTS (
                    SELECT 1
                    FROM OrganizationMembers om
                    WHERE om.MemberID = m.MemberID
                    AND om.OrganizationID = ?
                );
        `;
        const [rows] = await db.query(query, [organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
