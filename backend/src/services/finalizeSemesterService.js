const OrganizationMember = require('../models/OrganizationMember');
const Semester = require('../models/Semester');

const finalizeSemester = async (semesterID, organizationID) => {
    try {
        // Assuming you have a function to finalize the semester in your database
        const allMembers = await OrganizationMember.getAllMembersByOrgAndSemester(organizationID, semesterID);
        for (const member of allMembers) {
            if (member.GraduationSemesterID === semesterID) {
                console.log(`Member ${member.MemberID} is graduating this semester, updating status...`);
                await OrganizationMember.insertOrganizationMemberWithRoleStatus(organizationID, member.MemberID, semesterID, member.RoleID, 'Alumni');
            } else if (member.Status === 'Active' || member.Status === 'Exempt') {
                const nextSemesterID = await Semester.getNextSemester(semesterID);
                const nextSemesterStatus = await OrganizationMember.getMemberStatus(member.MemberID, organizationID, nextSemesterID);
                if (nextSemesterStatus !== 'Exempt') {
                    console.log(`Member ${member.MemberID} is Active or next semester not Exempt, updating status to CarryoverActive...`);
                    await OrganizationMember.insertOrganizationMemberWithRoleStatus(organizationID, member.MemberID, semesterID, member.RoleID, 'CarryoverActive');
                }
            } else if (member.Status === 'CarryoverActive') {
                console.log(`Member ${member.MemberID} is CarryoverActive, updating status to General...`);
                await OrganizationMember.insertOrganizationMemberWithRoleStatus(organizationID, member.MemberID, semesterID, member.RoleID, 'General');
            } else {
                console.log(`Member ${member.MemberID} has status: ${member.Status}, skipping...`);
            }
        }
    } catch (error) {
        console.error("Error finalizing semester:", error);
        throw error;
    }
}