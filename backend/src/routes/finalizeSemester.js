const express = require('express');
const router = express.Router();
const OrganizationMember = require('../models/OrganizationMember');
const Semester = require('../models/Semester');

router.post('/finalizeSemester', async (req, res) => {
    console.log("Finalizing semester with data:", req.body);
    const { orgID, selectedSemester } = req.body;
    if (!orgID || !selectedSemester) {
        return res.status(400).json({ error: 'Missing orgID or selectedSemester' });
    }
    try {
        await updateEventOccurrences(selectedSemester, orgID);
        await finalizeSemester(selectedSemester, orgID);
        return res.json({ success: true });
    } catch (error) {
        console.error("Error finalizing semester:", error);
        return res.status(500).json({ error: 'Failed to finalize semester' });
    }
});

const updateEventOccurrences = async (semesterID, organizationID) => {
    //count event occurences of each eventtype in the semester and update it in the database
    //then re-update all member statuses
}

const finalizeSemester = async (semesterID, organizationID) => {
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
}