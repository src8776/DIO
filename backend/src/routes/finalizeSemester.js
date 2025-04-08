const express = require('express');
const router = express.Router();
const OrganizationMember = require('../models/OrganizationMember');
const Semester = require('../models/Semester');
const EventInstance = require('../models/EventInstance');
const UseAccountStatus = require('../services/useAccountStatus');
const db = require('../config/db');

if (process.env.NODE_ENV === "production") {
    const requireAuth = async (req, res, next) => {
        if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
        }
        next();
    }
    router.use(requireAuth);
}

router.post('/', async (req, res) => {
    console.log("Finalizing semester with data:", req.body);
    const orgID = req.body.orgID;
    const currentSemester = req.body.selectedSemester;
    if (!orgID || !currentSemester) {
        return res.status(400).json({ error: 'Missing orgID or selectedSemester' });
    }
    try {
        await finalizeSemester(currentSemester, orgID);
        return res.json({ success: true });
    } catch (error) {
        console.error("Error finalizing semester:", error);
        return res.status(500).json({ error: 'Failed to finalize semester' });
    }
});


const finalizeSemester = async (currentSemester, organizationID) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction()
        const termCode = currentSemester.TermCode;
        const semesterID = currentSemester.SemesterID;
        const startTime = Date.now();
        //count event occurences of each eventtype in the current semester and update it in the database
        console.log(`Updating event occurrences for organization ${organizationID} in semester ${semesterID}...`);
        await EventInstance.updateEventOccurrences(organizationID, termCode, semesterID);
        const allMembers = await OrganizationMember.getAllMembersByOrgAndSemester(organizationID, semesterID);
        console.log(`Found ${allMembers.length} members for organization ${organizationID} in semester ${semesterID}:\n`, allMembers);
        const nextSemesterID = await Semester.getNextSemester(semesterID);
        for (const member of allMembers) {
            console.log(`**Processing member ${member.MemberID} with pre-updateMemberStatus status ${member.Status}...`);
            console.log('Recalculating current member status...');
            let newStatus = member.Status;
            if (member.Status !== 'Exempt') {
                newStatus = await UseAccountStatus.updateMemberStatus(member.MemberID, organizationID, currentSemester);
                console.log(`Processing member ${member.MemberID} with post-updateMemberStatus status ${newStatus}...`);
            }
            console.log(`Processing member ${member.MemberID} with post-updateMemberStatus status ${newStatus}...`);
            // Graduation Case
            if (member.GraduationSemester === termCode) {
                console.log(`Member ${member.MemberID} is graduating this semester, updating status to Alumni...`);
                await OrganizationMember.insertOrganizationMemberWithRoleStatus(organizationID, member.MemberID, nextSemesterID, member.RoleID, 'Alumni');
                console.log('Cleaning out member from future semesters...');
                await OrganizationMember.removeRecordsAfterSemester(organizationID, member.MemberID, nextSemesterID);
            } else if (newStatus === 'Active' || newStatus === 'Exempt') {
                const nextSemesterStatus = await OrganizationMember.getMemberStatus(member.MemberID, organizationID, nextSemesterID);
                if (nextSemesterStatus !== 'Exempt') {
                    console.log(`Member ${member.MemberID} is ${newStatus} and not Exempt next semester, updating status to CarryoverActive...`);
                    await OrganizationMember.insertOrganizationMemberWithRoleStatus(organizationID, member.MemberID, nextSemesterID, member.RoleID, 'CarryoverActive');
                } else {
                    console.log(`Member ${member.MemberID} is ${newStatus} and Exempt next semester, skipping...`);
                }
            } else {
                console.log(`Member ${member.MemberID} is ${newStatus}, skipping...`);
            }
        }
        const endTime = Date.now();
        console.log(`Finalize Semester completed in ${endTime - startTime} ms`);
    } catch (error) {
        console.error('Error finalizing semester:', error);
        throw error;
    }
}

module.exports = router;