const express = require('express');
const db = require('../config/db');
const Attendance = require('../models/Attendance');
const OrganizationMember = require('../models/OrganizationMember');
const useAccountStatus = require('../services/useAccountStatus');
const Semester = require('../models/Semester');
const router = express.Router();


router.get('/allDetails', async (req, res) => {
    let memberID = parseInt(req.query.memberID, 10);
    let organizationID = parseInt(req.query.organizationID, 10);

    if (isNaN(memberID) || isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid memberID or organizationID parameter' });
    }

    try {
        const query = `
            SELECT 
                m.*, 
                r.RoleName,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'AttendanceID', a.AttendanceID,
                            'MemberID', a.MemberID,
                            'EventID', a.EventID,
                            'Hours', a.Hours,
                            'CheckInTime', a.CheckInTime,
                            'EventType', et.EventType
                        )
                    ) 
                    FROM Attendance a
                    LEFT JOIN EventInstances ei ON a.EventID = ei.EventID
                    LEFT JOIN EventTypes et ON ei.EventTypeID = et.EventTypeID
                    WHERE a.MemberID = m.MemberID AND a.OrganizationID = ?
                ) AS attendanceRecords
            FROM Members m
            JOIN OrganizationMembers om ON m.MemberID = om.MemberID
            JOIN Roles r ON om.RoleID = r.RoleID
            WHERE m.MemberID = ? AND om.OrganizationID = ?;
        `;
        const [rows] = await db.query(query, [organizationID, memberID, organizationID]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/detailsBySemester', async (req, res) => {
    let memberID = parseInt(req.query.memberID, 10);
    let organizationID = parseInt(req.query.organizationID, 10);
    let termCode = req.query.termCode;

    if (isNaN(memberID) || isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid memberID or organizationID parameter' });
    }

    try {
        let query = `
            SELECT 
                m.*, 
                r.RoleName,
                ma.Title AS Major,
                om.Status AS status,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'AttendanceID', a.AttendanceID,
                            'MemberID', a.MemberID,
                            'EventID', a.EventID,
                            'Hours', a.Hours,
                            'CheckInTime', a.CheckInTime,
                            'EventType', et.EventType,
                            'EventTitle', ei.EventTitle
                        )
                    ) 
                    FROM Attendance a
                    LEFT JOIN EventInstances ei ON a.EventID = ei.EventID
                    LEFT JOIN EventTypes et ON ei.EventTypeID = et.EventTypeID
                    WHERE a.MemberID = m.MemberID AND a.OrganizationID = ?
        `;

        let subqueryParams = [organizationID];
        if (termCode) {
            query += ` AND ei.TermCode = ?`;
            subqueryParams.push(termCode);
        }

        query += `
                ) AS attendanceRecords
            FROM Members m
            JOIN OrganizationMembers om ON m.MemberID = om.MemberID
            JOIN Roles r ON om.RoleID = r.RoleID
            LEFT JOIN Majors ma ON m.MajorID = ma.MajorID
            WHERE m.MemberID = ? AND om.OrganizationID = ?;
        `;

        let mainParams = [memberID, organizationID];
        let params = [...subqueryParams, ...mainParams];

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching member details by semester:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/name', async (req, res) => {
    console.log('Received request at /name');

    let memberID = parseInt(req.query.memberID, 10);

    if (isNaN(memberID)) {
        return res.status(400).json({ error: 'Invalid memberID parameter' });
    }

    try {
        const query = `
            SELECT CONCAT(m.FirstName, ' ', m.LastName) AS fullName
            FROM Members m
            WHERE m.MemberID = ?;
        `;
        const [rows] = await db.query(query, [memberID]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ fullName: rows[0].fullName });
    } catch (error) {
        console.error('Error fetching member name:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/attendance', async (req, res) => {
    console.log('Received request at /attendance');

    let memberID = parseInt(req.query.memberID, 10);
    let organizationID = parseInt(req.query.organizationID, 10);
    let termCode = req.query.termCode;


    if (isNaN(memberID) || isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid memberID or organizationID parameter' });
    }

    try {
        const rows = await Attendance.getAttendanceByMemberAndOrg(memberID, organizationID, termCode);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Organization Info data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/status', async (req, res) => {
    console.log('Received request at /status');

    let memberID = parseInt(req.query.memberID, 10);
    let organizationID = parseInt(req.query.organizationID, 10);
    let semesterID = parseInt(req.query.semesterID, 10);

    if (isNaN(memberID) || isNaN(organizationID) || isNaN(semesterID)) {
        return res.status(400).json({ error: 'Invalid memberID or organizationID or semesterID parameter' });
    }

    try {
        const status = await OrganizationMember.getMemberStatus(memberID, organizationID, semesterID);
        if (!status) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ status });
    } catch (error) {
        console.error('Error fetching member status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/role', async (req, res) => {
    console.log('Received request at /role');
    console.log('Query Parameters:', req.query);

    let memberID = parseInt(req.query.memberID, 10);
    let organizationID = parseInt(req.query.organizationID, 10);

    if (isNaN(memberID) || isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid memberID or organizationID parameter' });
    }

    try {
        const role = await OrganizationMember.getMemberRole(memberID, organizationID);
        if (!role) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ role });
    } catch (error) {
        console.error('Error fetching member role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/addIndividualAttendance', async (req, res) => {
    const { memberID, organizationID, semesterID, eventType, eventDate, attendanceStatus, attendanceSource, hours, eventTitle } = req.body;
    console.log('Received request at /addIndividualAttendance');
    console.log('Request Body:', req.body);

    // Input validation
    if (isNaN(memberID) || isNaN(organizationID) || isNaN(semesterID) || !eventType || !eventDate || !attendanceStatus || !attendanceSource) {
        return res.status(400).json({ error: 'Invalid input parameters' });
    }

    try {
        // Step 1: Fetch TermCode from Semesters using semesterID
        const [semesterRows] = await db.query('SELECT * FROM Semesters WHERE SemesterID = ?', [semesterID]);
        if (!semesterRows.length) {
            return res.status(400).json({ error: 'Invalid semesterID' });
        }
        const semester = semesterRows[0];
        console.log('Semester record:', semester);

        const termCode = semester.TermCode;
        console.log('TermCode:', termCode);


        // Step 2: Fetch EventTypeID, ensuring it exists for this semester and organization
        const [eventTypeRow] = await db.query(`
            SELECT EventTypeID 
            FROM EventTypes 
            WHERE EventType = ? AND SemesterID = ? AND OrganizationID = ?
        `, [eventType, semesterID, organizationID]);
        console.log('Fetched event type data:', eventTypeRow);
        if (!eventTypeRow.length) {
            console.log('No event type found for:', { eventType, semesterID, organizationID });
            return res.status(400).json({ error: 'Event type does not exist for this semester and organization' });
        }
        const eventTypeID = eventTypeRow[0].EventTypeID;
        console.log('EventTypeID:', eventTypeID);

        // Step 3: Check for an existing EventInstance
        let [eventInstance] = await db.query(`
            SELECT EventID 
            FROM EventInstances 
            WHERE TermCode = ? AND OrganizationID = ? AND EventTypeID = ? AND EventDate = ?
        `, [termCode, organizationID, eventTypeID, eventDate]);
        console.log('Existing EventInstance query result:', eventInstance);

        // Step 4: If no EventInstance exists, create one
        if (!eventInstance.length) {
            const titleToUse = eventTitle || `${eventType} Event on ${eventDate}`;
            console.log('No existing EventInstance found. Creating new with title:', titleToUse);
            const [result] = await db.query(`
                INSERT INTO EventInstances (TermCode, OrganizationID, EventTypeID, EventDate, EventTitle)
                VALUES (?, ?, ?, ?, ?)
            `, [termCode, organizationID, eventTypeID, eventDate, titleToUse]);
            eventInstance = { EventID: result.insertId };
            console.log('Created new EventInstance with EventID:', eventInstance.EventID);
        } else {
            eventInstance = eventInstance[0];
            console.log('Using existing EventInstance with EventID:', eventInstance.EventID);
        }

        const eventID = eventInstance.EventID;

        // Step 5: Insert the attendance record
        await db.query(`
            INSERT INTO Attendance (MemberID, EventID, CheckInTime, AttendanceStatus, Hours, AttendanceSource, OrganizationID)
            VALUES (?, ?, NOW(), ?, ?, ?, ?)
        `, [memberID, eventID, attendanceStatus, hours || null, attendanceSource, organizationID]);
        console.log(`Attendance record inserted for MemberID ${memberID} with EventID ${eventID}`);

        // Log the insertion
        console.log(`[@memberDetails: EventID ${eventID} was added to MemberID ${memberID}'s attendance records]`);

        // Step 6: Update member status
        await useAccountStatus.updateMemberStatus(memberID, organizationID, semester)
        console.log('Updated member status for MemberID:', memberID, 'for semester:', semester);

        // Step 7: Fetch updated member data
        const [memberRows] = await db.query(`
            SELECT 
                m.MemberID,
                m.FullName,
                COALESCE(om.Status, 'N/A') AS Status,
                COUNT(CASE WHEN a.AttendanceStatus = 'Attended' THEN 1 END) AS AttendanceRecord,
                MAX(a.LastUpdated) AS LastUpdated
            FROM Members m
            LEFT JOIN OrganizationMembers om ON m.MemberID = om.MemberID 
                AND om.OrganizationID = ? 
                AND om.SemesterID = ?
            LEFT JOIN Attendance a ON m.MemberID = a.MemberID 
                AND a.OrganizationID = ? 
                AND a.EventID IN (
                    SELECT EventID 
                    FROM EventInstances 
                    WHERE TermCode = ?
                )
            WHERE m.MemberID = ?
            GROUP BY m.MemberID, m.FullName, om.Status
        `, [organizationID, semesterID, organizationID, termCode, memberID]);

        if (!memberRows.length) {
            return res.status(404).json({ error: 'Member not found after update' });
        }

        const updatedMember = memberRows[0];

        // Step 8: Success response with updated member data
        res.status(201).json({
            message: 'Attendance record added successfully',
            updatedMember: {
                MemberID: updatedMember.MemberID,
                FullName: updatedMember.FullName,
                Status: updatedMember.Status,
                AttendanceRecord: updatedMember.AttendanceRecord || 0,
                LastUpdated: updatedMember.LastUpdated ? updatedMember.LastUpdated.toISOString() : null
            }
        });
    } catch (error) {
        console.error('Error adding attendance record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/removeIndividualAttendance', async (req, res) => {
    const { attendanceID, memberID, eventID, organizationID, semester } = req.body;

    // Input validation
    if (isNaN(memberID) || isNaN(eventID) || isNaN(organizationID)) {
        return res.status(400).json({ error: 'Invalid input parameters' });
    }

    try {
        // Step 1: Delete the attendance record
        const [result] = await db.query(`
            DELETE FROM Attendance 
            WHERE AttendanceID = ? AND MemberID = ? AND EventID = ? AND OrganizationID = ?
        `, [attendanceID, memberID, eventID, organizationID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        // Step 2: Update member status
        console.log(`[@memberDetails: AttendnaceID ${attendanceID} was deleted from MemberID ${memberID}'s attendance records]`);

        // Re-Evaluate status
        await useAccountStatus.updateMemberStatus(memberID, organizationID, semester)

        // Step 3: Fetch updated member data
        const [memberRows] = await db.query(`
        SELECT 
            m.MemberID,
            m.FullName,
            COALESCE(om.Status, 'N/A') AS Status,
            COUNT(CASE WHEN a.AttendanceStatus = 'Attended' THEN 1 END) AS AttendanceRecord,
            MAX(a.LastUpdated) AS LastUpdated
        FROM Members m
        LEFT JOIN OrganizationMembers om ON m.MemberID = om.MemberID 
            AND om.OrganizationID = ? 
            AND om.SemesterID = ?
        LEFT JOIN Attendance a ON m.MemberID = a.MemberID 
            AND a.OrganizationID = ? 
            AND a.EventID IN (
                SELECT EventID 
                FROM EventInstances 
                WHERE TermCode = ?
            )
        WHERE m.MemberID = ?
        GROUP BY m.MemberID, m.FullName, om.Status
    `, [organizationID, semester.SemesterID, organizationID, semester.TermCode, memberID]);

        if (!memberRows.length) {
            return res.status(404).json({ error: 'Member not found after update' });
        }

        const updatedMember = memberRows[0];

        // Step 4: Success response with updated member data
        res.status(200).json({
            message: 'Attendance record removed successfully',
            updatedMember: {
                MemberID: updatedMember.MemberID,
                FullName: updatedMember.FullName,
                Status: updatedMember.Status,
                AttendanceRecord: updatedMember.AttendanceRecord || 0,
                LastUpdated: updatedMember.LastUpdated ? updatedMember.LastUpdated.toISOString() : null
            }
        });
    } catch (error) {
        console.error('Error removing attendance record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;