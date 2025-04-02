const express = require('express');
const router = express.Router();
const OrganizationMember = require('../models/OrganizationMember');
const Semester = require('../models/Semester');
const EventInstance = require('../models/EventInstance');
const UseAccountStatus = require('../services/useAccountStatus');

router.post('/', async (req, res) => {
    console.log("Finalizing semester with data:", req.body);
    const orgID = req.body.orgID;
    const semesterID = req.body.selectedSemester.SemesterID;
    const termCode = req.body.selectedSemester.TermCode;
    if (!orgID || !termCode || !semesterID) {
        return res.status(400).json({ error: 'Missing orgID or selectedSemester' });
    }
    try {
        await finalizeSemester(semesterID, orgID);
        return res.json({ success: true });
    } catch (error) {
        console.error("Error finalizing semester:", error);
        return res.status(500).json({ error: 'Failed to finalize semester' });
    }
});


const finalizeSemester = async (semesterID, organizationID) => {
    //count event occurences of each eventtype in the current semester and update it in the database
    await EventInstance.updateEventOccurrences(organizationID, semesterID);
    const currentSemester = await Semester.getSemesterByID(semesterID);
    const allMembers = await OrganizationMember.getAllMembersByOrgAndSemester(organizationID, semesterID);
    console.log(`Found ${allMembers.length} members for organization ${organizationID} in semester ${semesterID}:\n`, allMembers);
    const nextSemesterID = await Semester.getNextSemester(semesterID);
    for (const member of allMembers) {
        console.log('Recalculating current member status...')
        await UseAccountStatus.updateMemberStatus(member.MemberID, organizationID, currentSemester);
        console.log(`Processing member ${member.MemberID} with status ${member.Status}...`);
        if (member.GraduationSemester === currentSemester.TermCode) {
            console.log(`Member ${member.MemberID} is graduating this semester, updating status to Alumni...`);
            await OrganizationMember.insertOrganizationMemberWithRoleStatus(organizationID, member.MemberID, nextSemesterID, member.RoleID, 'Alumni');
            console.log('Cleaning out member from future semesters...');
            await OrganizationMember.removeRecordsAfterSemester(organizationID, member.MemberID, nextSemesterID);
        } else if (member.Status === 'General') {
            console.log(`Member ${member.MemberID} has status: ${member.Status}, skipping...`)
        }
        // else if (member.Status === 'Active' || member.Status === 'Exempt') {
        //     const nextSemesterStatus = await OrganizationMember.getMemberStatus(member.MemberID, organizationID, nextSemesterID);
        //     if (nextSemesterStatus !== 'Exempt') {
        //         console.log(`Member ${member.MemberID} is Active or next semester not Exempt, updating status to CarryoverActive...`);
        //         await OrganizationMember.insertOrganizationMemberWithRoleStatus(organizationID, member.MemberID, nextSemesterID, member.RoleID, 'CarryoverActive');
        //     }
        // } else (member.Status === 'CarryoverActive') {
        //     console.log(`Member ${member.MemberID} is CarryoverActive, updating status to General...`);
        //     await OrganizationMember.insertOrganizationMemberWithRoleStatus(organizationID, member.MemberID, nextSemesterID, member.RoleID, 'General');
        // } 
    }
}

module.exports = router;