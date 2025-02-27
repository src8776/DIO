const membershipStatus = require('./membershipStatus');
const OrganizationSetting = require('../models/OrganizationSetting');
const EventRule = require('../models/EventRule');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

const updateMemberStatus = async (memberID, organizationID) => {
    const activeReqData = await OrganizationSetting.getActiveRequirementByOrg(organizationID);
    const orgRulesData = await EventRule.getEventRulesByOrg(organizationID);
    const attendanceData = await Attendance.getAttendanceByMemberAndOrg(memberID, organizationID);
    const statusObject = useAccountStatus(activeReqData, orgRulesData, attendanceData);
    await Member.updateMemberStatus(memberID, statusObject.status);
}

const useAccountStatus = (activeReqData, orgRulesData, attendanceData) => {
    let activeRequirement = '';
    let requirementType = '';
    let statusObject = {};

    // Process activeRequirement data.
    if (activeReqData.length > 0) {
        activeRequirement = activeReqData[0].ActiveRequirement;
        requirementType = activeReqData[0].Description;
    } else {
        activeRequirement = null;
        requirementType = null;
    }

    // Process user's attendance data.
    const attendanceRecords = attendanceData.length > 0 ? attendanceData[0].attendanceRecord : [];

    // Once all data is available, call the algorithm.
    if (orgRulesData && attendanceRecords.length > 0 && activeReqData[0]?.ActiveRequirement) {
        statusObject = membershipStatus.determineMembershipStatusModular(
            attendanceRecords,
            { eventTypes: orgRulesData },
            activeReqData[0].ActiveRequirement
        );
    }

    return statusObject;
}

module.exports = {updateMemberStatus, useAccountStatus};