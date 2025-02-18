const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.post('/hours', async (req, res) => {
    console.log('Received request at /api/admin/volunteers/hours');
    const data = req.body;
    const organizationID = data.orgID;
    const eventType = data.eventType;
    let eventID = null;
    try {
        const query = `
            SELECT 
                EventTypeID
            FROM 
                EventTypes
            WHERE OrganizationID = ? AND EventType = ?
            LIMIT 1
        `;
        const [rows] = await db.query(query, [organizationID, eventType]);
        eventID = rows[0].EventTypeID;
    } catch (error) {
        console.error('Error fetching Events data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    for (const member of data.members) {
        const pointsEarned = member.hours * 10; //TODO need to figure out how to calculate how many points earned based on volunteer hours
        try {
            //TODO what do we need to do with member.date?
            const query = `INSERT INTO MemberPoints (MemberID, OrganizationID, EventID, PointsEarned, VolunteerHours) VALUES (?, ?, ?, ?, ?)`;
            await db.query(query, [member.MemberID, organizationID, eventID, pointsEarned, member.hours]);
            return res.json({
                success: true,
                message: 'Volunteers successfully uploaded',
            });
        } catch (error) {
            console.error('Failed to insert volunteer hours into database', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to insert volunteer hours into database', 
                error: message 
            });
        }
    };
});

module.exports = router;
