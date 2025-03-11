const membershipStatus = require('./membershipStatus');
const OrganizationSetting = require('../models/OrganizationSetting');
const EventRule = require('../models/EventRule');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const OrganizationMember = require('../models/OrganizationMember');
const { sendActiveStatusEmail } = require('../utils/email');


// TODO: Update to take in semester
const updateMemberStatus = async (memberID, organizationID, semester) => {
    try {
        const activeReqData = await OrganizationSetting.getActiveRequirementByOrg(organizationID, semester.SemesterID);
        const orgRulesData = await EventRule.getEventRulesByOrgAndSemester(organizationID, semester.SemesterID);
        const attendanceData = await Attendance.getAttendanceByMemberAndOrg(memberID, organizationID, semester.TermCode);
        const statusObject = useAccountStatus(activeReqData, orgRulesData, attendanceData);

        const memberName = await Member.getMemberNameById(memberID);
        const currentStatus = await OrganizationMember.getMemberStatus(memberID, organizationID);
        const memberEmail = await Member.getMemberEmailById(memberID);

        // only update if newly active
        if (currentStatus !== 'Exempt' && currentStatus !== 'Active') {
            await OrganizationMember.updateMemberStatus(memberID, organizationID, statusObject.status);
            if (statusObject.status === 'Active') {
                // await sendActiveStatusEmail(organizationID, memberName, memberEmail); // disable for now so we don't spam students :)
                console.log(`Would send email to ${memberEmail} (disabled)`);
            }
        }
    } catch (error) {
        console.error(`Error updating status for member ${memberID}:`, error);
    }

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