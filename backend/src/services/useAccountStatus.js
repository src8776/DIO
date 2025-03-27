const membershipStatus = require('./membershipStatus');
const OrganizationSetting = require('../models/OrganizationSetting');
const EventRule = require('../models/EventRule');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const OrganizationMember = require('../models/OrganizationMember');
const { sendActiveStatusEmail } = require('../utils/email');


const updateMemberStatus = async (memberID, organizationID, semester) => {
    try {
        const activeReqData = await OrganizationSetting.getActiveRequirementByOrg(organizationID, semester.SemesterID);
        const orgRulesData = await EventRule.getEventRulesByOrgAndSemester(organizationID, semester.SemesterID);
        const attendanceData = await Attendance.getAttendanceByMemberAndOrg(memberID, organizationID, semester.TermCode);
        console.log('Attendance Data:', attendanceData);
        const statusObject = useAccountStatus(activeReqData, orgRulesData, attendanceData);

        console.log('Member ID @ useAccountStatus:', memberID);

        // Retrieve memberName, currentStatus, memberEmail concurrently.
        const [memberName, currentStatus, memberEmail] = await Promise.all([
            Member.getMemberNameById(memberID),
            OrganizationMember.getMemberStatus(memberID, organizationID, semester.SemesterID),
            Member.getMemberEmailById(memberID)
        ]);

        console.log('Member Name @ useAccountStatus:', memberName);

        // Update if non-Exempt and status has changed (allows Active -> General update)
        if (currentStatus !== 'Exempt' && currentStatus !== statusObject.status) {
            await OrganizationMember.updateMemberStatus(memberID, organizationID, statusObject.status, semester.SemesterID);
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
    console.log('Attendance Records Used to Determine Status:', attendanceRecords);
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

module.exports = { updateMemberStatus, useAccountStatus };