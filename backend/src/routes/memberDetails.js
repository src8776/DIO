const express = require('express');
const db = require('../config/db');
const Attendance = require('../models/Attendance');
const OrganizationMember = require('../models/OrganizationMember');
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

    let memberID = parseInt(req.query.memberID, 10);
    let organizationID = parseInt(req.query.organizationID, 10);
    let semesterID = parseInt(req.query.semesterID, 10);

    if (isNaN(memberID) || isNaN(organizationID) || isNaN(semesterID)) {
        return res.status(400).json({ error: 'Invalid memberID or organizationID or semesterID parameter' });
    }

    try {
        const role = await OrganizationMember.getMemberRole(memberID, organizationID, semesterID);
        if (!role) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ role });
    } catch (error) {
        console.error('Error fetching member role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;