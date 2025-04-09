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

router.get('/datatableAllTerms', async (req, res) => {
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


router.get('/datatableByTerm', async (req, res) => {
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
                AND Semesters.TermCode = ?
                AND (OrganizationMembers.Status NOT LIKE 'Alumni'
                OR OrganizationMembers.Status IS NULL);
        `;
        const [rows] = await db.query(query, [organizationID, termCode, organizationID, termCode, organizationID, termCode]);
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/getSemesters', async (req, res) => {
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

router.get('/getOfficersAndAdmin', async (req, res) => {
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



router.post('/setOfficer', async (req, res) => {
    console.log('Received request at /admin/setOfficer');
    let organizationID = parseInt(req.query.organizationID, 10);
    let memberID = parseInt(req.query.memberID, 10);

    try {
        // Check if the member has an admin role in any organization
        const checkAdminQuery = `
            SELECT *
            FROM OrganizationMembers
            WHERE MemberID = ?
            AND RoleID = 1;
        `;
        const [adminRecords] = await db.query(checkAdminQuery, [memberID]);

        if (adminRecords && adminRecords.length > 0) {
            // Update all organizations where the member is set as admin to officer (RoleID = 3)
            const updateAdminQuery = `
                UPDATE OrganizationMembers
                SET RoleID = 3
                WHERE MemberID = ?
                AND RoleID = 1;
            `;
            await db.query(updateAdminQuery, [memberID]);
        } else {
            // Update only the specified organization's record to officer
            const query = `
                UPDATE OrganizationMembers
                SET RoleID = 3
                WHERE MemberID = ?
                AND OrganizationID = ?;
            `;
            await db.query(query, [memberID, organizationID]);
        }
        res.json({ message: 'Member updated to Officer role.' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/setAdmin', async (req, res) => {
    console.log('Received request at /admin/setAdmin (multi-org update)');
    const memberID = parseInt(req.query.memberID, 10);

    try {
        // 1. Retrieve the active semester.
        const activeSemQuery = `
            SELECT SemesterID 
            FROM Semesters 
            WHERE isActive = 1 
            LIMIT 1;
        `;
        const [activeSemesters] = await db.query(activeSemQuery);
        if (!activeSemesters || activeSemesters.length === 0) {
            return res.status(500).json({ error: 'No active semester found' });
        }
        const activeSemesterID = activeSemesters[0].SemesterID;

        // 2. Retrieve all distinct organizations.
        const orgsQuery = `
            SELECT DISTINCT OrganizationID 
            FROM OrganizationMembers;
        `;
        const [orgs] = await db.query(orgsQuery);
        let results = [];

        // 3. For each organization, update if record exists; otherwise, insert.
        for (const org of orgs) {
            const organizationID = org.OrganizationID;

            // Check if the member is recorded for this organization in the active semester.
            const checkQuery = `
                SELECT * 
                FROM OrganizationMembers 
                WHERE MemberID = ? 
                AND OrganizationID = ? 
                AND SemesterID = ?;
            `;
            const [existingRecords] = await db.query(checkQuery, [memberID, organizationID, activeSemesterID]);

            if (existingRecords && existingRecords.length > 0) {
                // Update record to set RoleID = 1 (admin).
                const updateQuery = `
                    UPDATE OrganizationMembers
                    SET RoleID = 1
                    WHERE MemberID = ? 
                    AND OrganizationID = ? 
                    AND SemesterID = ?;
                `;
                const [updateResult] = await db.query(updateQuery, [memberID, organizationID, activeSemesterID]);
                results.push({ organizationID, action: 'updated', detail: updateResult });
            } else {
                // Insert new record with RoleID = 1 for the current active semester.
                const insertQuery = `
                    INSERT INTO OrganizationMembers (MemberID, OrganizationID, SemesterID, RoleID)
                    VALUES (?, ?, ?, 1);
                `;
                const [insertResult] = await db.query(insertQuery, [memberID, organizationID, activeSemesterID]);
                results.push({ organizationID, action: 'inserted', detail: insertResult });
            }
        }

        res.json({ message: 'Admin status updated in all organizations for the active semester', results });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// used to remove admin/officer role
router.post('/setMember', async (req, res) => {
    console.log('Received request at /admin/setMember');
    let organizationID = parseInt(req.query.organizationID, 10);
    let memberID = parseInt(req.query.memberID, 10);

    try {
        // Check if the member has an admin role in any organization
        const checkAdminQuery = `
            SELECT *
            FROM OrganizationMembers
            WHERE MemberID = ?
            AND RoleID = 1;
        `;
        const [adminRecords] = await db.query(checkAdminQuery, [memberID]);

        if (adminRecords && adminRecords.length > 0) {
            // Update all organizations where the member is set as admin to member (RoleID = 2)
            const updateAdminQuery = `
                UPDATE OrganizationMembers
                SET RoleID = 2
                WHERE MemberID = ?
                AND RoleID = 1;
            `;
            await db.query(updateAdminQuery, [memberID]);
        } else {
            // Update only the specified organization's record to member
            const query = `
                UPDATE OrganizationMembers
                SET RoleID = 2
                WHERE MemberID = ?
                AND OrganizationID = ?;
            `;
            await db.query(query, [memberID, organizationID]);
        }
        res.json({ message: 'Member updated to Member role.' });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;