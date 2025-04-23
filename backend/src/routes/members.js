const express = require('express');
const db = require('../config/db');

const router = express.Router();

if (process.env.NODE_ENV === "production") {
    const requireAuth = async (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        next();
    }
    router.use(requireAuth);
}

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
    console.log('Received request at /api/admin/members/add with body:', req.body);
    let { firstName, lastName, email, organizationID, semesterID } = req.body;
    if (!firstName || !lastName || !email || !organizationID || !semesterID) {
        return res.status(400).json({ error: 'All fields (first name, last name, email, organizationID, semesterID) are required.' });
    }
    email = email.toLowerCase();
    const userName = email.split('@')[0];
    const fullName = `${firstName} ${lastName}`.trim();

    try {
        // 1. Check if member exists by email
        let query = 'SELECT MemberID FROM Members WHERE Email = ?';
        let [rows] = await db.query(query, [email]);

        let memberID;
        if (rows.length === 0) {
            // 2. Member does not exist, create them
            query = 'INSERT INTO Members (UserName, FirstName, LastName, Email, FullName) VALUES (?, ?, ?, ?, ?)';
            const [result] = await db.query(query, [userName, firstName, lastName, email, fullName]);
            memberID = result.insertId;
        } else {
            // 3. Member exists, get their ID
            memberID = rows[0].MemberID;
        }

        // 4. Check if already in OrganizationMembers for this org/semester
        query = 'SELECT * FROM OrganizationMembers WHERE MemberID = ? AND OrganizationID = ? AND SemesterID = ?';
        [rows] = await db.query(query, [memberID, organizationID, semesterID]);
        if (rows.length > 0) {
            return res.status(409).json({ error: 'This member is already in the organization for the selected semester.' });
        }

        // 5. Add to OrganizationMembers
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
