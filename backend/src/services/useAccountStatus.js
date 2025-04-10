const membershipStatus = require('./membershipStatus');
const OrganizationSetting = require('../models/OrganizationSetting');
const EventRule = require('../models/EventRule');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const OrganizationMember = require('../models/OrganizationMember');
const { sendActiveStatusEmail } = require('../utils/email');


const updateMemberStatus = async (memberID, organizationID, semester, connection) => {
    try {
        // Fetch requirement, rules, and attendance concurrently.
        const [activeReqData, orgRulesData, attendanceData] = await Promise.all([
            OrganizationSetting.getActiveRequirementByOrg(organizationID, semester.SemesterID, connection),
            EventRule.getEventRulesByOrgAndSemester(organizationID, semester.SemesterID, connection),
            Attendance.getAttendanceByMemberAndOrg(memberID, organizationID, semester.TermCode, connection)
        ]);
        console.log('Attendance Data:', attendanceData);

        // Retrieve currentStatus, memberName, memberEmail concurrently.
        const [currentStatus, memberName, memberEmail] = await Promise.all([
            OrganizationMember.getMemberStatus(memberID, organizationID, semester.SemesterID, connection),
            Member.getMemberNameById(memberID, connection),
            Member.getMemberEmailById(memberID, connection)
        ]);
        console.log('Member ID @ useAccountStatus:', memberID);
        console.log('Member Name @ useAccountStatus:', memberName);

        // Pass currentStatus into the account status algorithm.
        const statusObject = useAccountStatus(activeReqData, orgRulesData, attendanceData, currentStatus);

        // Update if non-Exempt and status has changed (allows Active -> General update)
        if (currentStatus !== 'Exempt' && currentStatus !== statusObject.status) {
            await OrganizationMember.updateMemberStatus(memberID, organizationID, statusObject.status, semester.SemesterID, connection);
            if (statusObject.status === 'Active') {
                await sendActiveStatusEmail(organizationID, memberName, memberEmail); // disabled to prevent spamming
                console.log(`Would send email to ${memberEmail} (disabled)`);
            }
            return statusObject.status;
        } else {
            return currentStatus;
        }
    } catch (error) {
        console.error(`Error updating status for member ${memberID}:`, error);
    }
}

const useAccountStatus = (activeReqData, orgRulesData, attendanceData, currentStatus) => {
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
    if (orgRulesData && attendanceRecords && attendanceRecords.length > 0 && activeReqData[0]?.ActiveRequirement) {
        statusObject = membershipStatus.determineMembershipStatusModular(
            attendanceRecords,
            { eventTypes: orgRulesData },
            activeReqData[0].ActiveRequirement,
            currentStatus
        );
    }
    return statusObject;
}

module.exports = { updateMemberStatus, useAccountStatus };