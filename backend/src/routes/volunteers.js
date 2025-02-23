const express = require('express');
const Attendance = require('../models/Attendance');
const EventInstance = require('../models/EventInstance');

const router = express.Router();

router.post('/hours', async (req, res) => {
    console.log('Received request at /api/admin/volunteers/hours');
    const data = req.body;
    const organizationID = data.orgID;
    const eventType = data.eventType;

    for (const member of data.members) {
        try {
            console.log(member.date);
            const eventDate = member.date;
            // Fetch EventID once
            const eventID = await EventInstance.getEventID(eventType, eventDate, organizationID);
            if(!eventID) {
                return res.status(400).json({
                    success: false, 
                    message: 'EventID does not exist', 
                    error: 'EventID does not exist'
                });
            }
            await Attendance.insertVolunteerHours(member.MemberID, eventID, organizationID, member.hours, eventDate);
            
        } catch (error) {
            console.error('Failed to insert volunteer hours into database', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to insert volunteer hours into database', 
                error: error.message
            });
        }
        
    };
    return res.json({
        success: true,
        message: 'Volunteers successfully uploaded',
    });
});

module.exports = router;
