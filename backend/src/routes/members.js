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


router.post('/add', async (req, res) => {
    const { firstName, lastName, email, organizationID, semesterID } = req.body;
    const userName = email.split('@')[0];
    const fullName = `${firstName} ${lastName}`;
    console.log('Adding member:', { firstName, lastName, email}, '\nTo Org:', { organizationID }, '\nIn Semester: ', {semesterID });

    try{
        let query = 'SELECT MemberID FROM Members WHERE Email = ?';
        let [rows] = await db.query(query, [email]);

        let memberID;
        if(rows.length > 0){
            memberID = rows[0].MemberID;
        } else {
            query = 'INSERT INTO Members (UserName, FirstName, LastName, Email, FullName) VALUES (?, ?, ?, ?, ?)';
            const [result] = await db.query(query, [userName, firstName, lastName, email, fullName]);
            memberID = result.insertId;
        }

        query = 'INSERT INTO OrganizationMembers (MemberID, OrganizationID, SemesterID, RoleID) VALUES (?, ?, ?, 2)';
        await db.query(query, [memberID, organizationID, semesterID]);

        res.status(201).json({ message: 'Member added to organization successfully'})
    }catch (error){
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
