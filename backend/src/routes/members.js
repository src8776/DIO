const express = require('express');
const db = require('../config/db');

const router = express.Router();

const requireAuth = async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    next();
}
router.use(requireAuth);

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


router.post('/add', async (req, res) => {
    const { firstName, lastName, email, organizationID, semesterID } = req.body;
    const userName = email.split('@')[0];
    const fullName = `${firstName} ${lastName}`.trim();

    // Reject insert if fullName is empty
    if (!fullName) {
        return res.status(400).json({ error: 'Full name is required' });
    }

    console.log('Adding member:', { fullName, email}, '\nTo Org:', { organizationID }, '\nIn Semester: ', {semesterID });

    try {
        let query = 'SELECT MemberID FROM Members WHERE Email = ?';
        let [rows] = await db.query(query, [email]);

        // Block the action if a member with the same email already exists
        if (rows.length > 0) {
            return res.status(409).json({ error: 'A member with this email already exists' });
        }

        query = 'INSERT INTO Members (UserName, FirstName, LastName, Email, FullName) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [userName, firstName, lastName, email, fullName]);
        const memberID = result.insertId;

        query = 'INSERT INTO OrganizationMembers (MemberID, OrganizationID, SemesterID, RoleID) VALUES (?, ?, ?, 2)';
        await db.query(query, [memberID, organizationID, semesterID]);

        res.status(201).json({ message: 'Member added to organization successfully' });
        console.log('MemberID:', { memberID }, 'added successfully');
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
