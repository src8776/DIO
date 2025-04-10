const express = require('express');
const router = express.Router();
const OrganizationMember = require('../models/OrganizationMember');
const Semester = require('../models/Semester');
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
    console.log("Re-Evaluating member status' with data:", req.body);
    const orgID = req.body.orgID;
    const currentSemester = req.body.selectedSemester;
    if (!orgID || !currentSemester) {
        return res.status(400).json({ error: 'Missing orgID or selectedSemester' });
    }
    try {
        const results = await reEvaluateStatus(currentSemester, orgID);
        return res.json({
            success: true,
            ...results
        });
    } catch (error) {
        console.error("Error re-evaluating status':", error);
        return res.status(500).json({ error: 'Failed to re-evaluate status' });
    }
});


const reEvaluateStatus = async (currentSemester, organizationID) => {
    const connection = await db.getConnection();
    const startTime = Date.now();
    const semesterObject = await Semester.getSemesterByID(currentSemester.SemesterID, connection);
    let updatedCount = 0;
    let exemptCount = 0;
    try {
        await connection.beginTransaction()
        const semesterID = currentSemester.SemesterID;

        // grab all members in the current semester
        const allMembers = await OrganizationMember.getAllMembersByOrgAndSemester(organizationID, semesterID);
        console.log(`Found ${allMembers.length} members for organization ${organizationID} in semester ${semesterID}:`);

        // re-evaluate each member's status
        for (const member of allMembers) {
            console.log(`**Processing member ${member.MemberID} with pre-updateMemberStatus status ${member.Status}...`);
            console.log('Recalculating current member status...');
            let newStatus = member.Status;

            if (member.Status !== 'Exempt') {
                newStatus = await UseAccountStatus.updateMemberStatus(member.MemberID, organizationID, semesterObject);
                console.log(`Processing member ${member.MemberID} with post-updateMemberStatus status ${newStatus}...`);
                updatedCount++;
            } else {
                exemptCount++;
            }
        }
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    const processingTime = Date.now() - startTime;
    console.log(`Re-evaluation of member statuses took ${processingTime}ms`);

    return {
        totalMembers: updatedCount + exemptCount,
        updatedMembers: updatedCount,
        exemptMembers: exemptCount,
        processingTimeMs: processingTime
    };
}

module.exports = router;