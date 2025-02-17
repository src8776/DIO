const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/allDetails', async (req, res) => {
    console.log('Received request at /allDetails');

    let memberID = parseInt(req.query.memberID, 10); // Convert to an integer

    if (isNaN(memberID)) {
        return res.status(400).json({ error: 'Invalid memberID parameter' });
    }

    try {
        const query = `
           
            SELECT 
                m.*, 
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'AttendanceID', a.AttendanceID,
                            'MemberID', a.MemberID,
                            'EventID', a.EventID,
                            'CheckInTime', a.CheckInTime
                        )
                    ) 
                    FROM attendance a 
                    WHERE a.MemberID = m.MemberID
                ) AS attendanceRecords
            FROM members m
            WHERE m.MemberID = ?;
        `;
        const [rows] = await db.query(query, [memberID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;