const express = require('express');
const Attendance = require('../models/Attendance');
const EventInstance = require('../models/EventInstance');
const useAccountStatus = require('../services/useAccountStatus');
const OrganizationSetting = require('../models/OrganizationSetting');
const EventRule = require('../models/EventRule');
const router = express.Router();

router.post('/hours', async (req, res) => {
    console.log('Received request at /api/admin/volunteers/hours');
    const data = req.body;
    const organizationID = data.orgID;
    const eventType = data.eventType;
    //TODO: SUPPORT TRANSACTIONS
    for (const member of data.members) {
        try {
            console.log("processing hours volunteers.js member " + member.FullName + member.MemberID);
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
            
            //recalculate member status
            const activeReqData = await OrganizationSetting.getActiveRequirementByOrg(organizationID);
            const orgRulesData = await EventRule.getEventRulesByOrg(organizationID);
            const attendanceData = await Attendance.getAttendanceByMemberAndOrg(member.MemberID, organizationID);
            const statusObject = useAccountStatus.useAccountStatus(activeReqData, orgRulesData, attendanceData);
            console.log(statusObject.status + " statusObject.status from volunteers.js");
            //TODO: UPDATE THE MEMBER STATUS IN THE DATABASE

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
