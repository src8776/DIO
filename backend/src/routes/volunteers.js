const express = require('express');
const Attendance = require('../models/Attendance');
const EventInstance = require('../models/EventInstance');
const useAccountStatus = require('../services/useAccountStatus');
const OrganizationSetting = require('../models/OrganizationSetting');
const EventRule = require('../models/EventRule');
const Member = require('../models/Member');
const db = require('../config/db'); // Add this line to import the database connection
const router = express.Router();

router.post('/hours', async (req, res) => {
    console.log('Received request at /api/admin/volunteers/hours');
    const data = req.body;
    const organizationID = data.orgID;
    const eventType = data.eventType;
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        for (const member of data.members) {
            try {
                console.log("processing hours volunteers.js member " + member.FullName + member.MemberID);
                const eventDate = member.date;
                const eventID = await EventInstance.getEventID(eventType, eventDate, organizationID);
                
                await Attendance.insertVolunteerHours(member.MemberID, eventID, organizationID, member.hours, eventDate);
                
                //recalculate member status
                const activeReqData = await OrganizationSetting.getActiveRequirementByOrg(organizationID);
                const orgRulesData = await EventRule.getEventRulesByOrg(organizationID);
                const attendanceData = await Attendance.getAttendanceByMemberAndOrg(member.MemberID, organizationID);
                const statusObject = useAccountStatus.useAccountStatus(activeReqData, orgRulesData, attendanceData);
                console.log(statusObject.status + " statusObject.status from volunteers.js");
                
                await Member.updateMemberStatus(member.MemberID, statusObject.status === 'active' ? 1 : 0);

            } catch (error) {
                console.error('Failed to insert volunteer hours into database', error);
                await connection.rollback();
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to insert volunteer hours into database', 
                    error: error.message
                });
            }
        };
        
        await connection.commit();
        return res.json({
            success: true,
            message: 'Volunteers successfully uploaded',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Transaction failed, rolled back:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Transaction failed, rolled back', 
            error: error.message
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
