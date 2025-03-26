const express = require('express');
const db = require('../config/db');
const router = express.Router();


router.get('/memberTallies', async (req, res) => {
    const { organizationID, semesterID } = req.query;

    try {
        const [rows] = await db.query(
            `SELECT 
                COUNT(*) AS totalMembers,
                SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS activeMembers,
                SUM(CASE WHEN Status = 'General' THEN 1 ELSE 0 END) AS generalMembers
            FROM OrganizationMembers
            WHERE OrganizationID = ? AND SemesterID = ?`,
            [organizationID, semesterID]
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/memberTalliesBySemesters', async (req, res) => {
    const { organizationID, semesterIDs } = req.query;

    if (!organizationID || !semesterIDs) {
        return res.status(400).json({ error: 'Missing organizationID or semesterIDs' });
    }

    // Process semesterIDs (expects a comma-separated string, e.g., "1,2,3")
    const semesterArray = semesterIDs.split(',').map(id => id.trim()).filter(Boolean);

    if (semesterArray.length === 0) {
        return res.status(400).json({ error: 'Invalid semesterIDs parameter' });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                SemesterID,
                COUNT(*) AS totalMembers,
                SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS activeMembers,
                SUM(CASE WHEN Status = 'General' THEN 1 ELSE 0 END) AS generalMembers
             FROM OrganizationMembers
             WHERE OrganizationID = ? AND SemesterID IN (?)
             GROUP BY SemesterID`,
            [organizationID, semesterArray]
        );
        res.json(rows);
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/averageAttendance', async (req, res) => {
    const { organizationID, semesterID } = req.query;

    if (!organizationID || !semesterID) {
        return res.status(400).json({ error: 'Missing organizationID or semesterID' });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                EventTypeID,
                EventType,
                AVG(attendance_rate) AS averageAttendanceRate
            FROM (
                SELECT 
                    ei.EventID,
                    et.EventType,
                    et.EventTypeID,
                    COALESCE(COUNT(CASE WHEN a.AttendanceStatus = 'Attended' THEN 1 END), 0) / 
                    GREATEST((SELECT COUNT(*) FROM OrganizationMembers WHERE OrganizationID = ? AND SemesterID = ?), 1) AS attendance_rate
                FROM EventInstances ei
                JOIN EventTypes et 
                    ON ei.EventTypeID = et.EventTypeID 
                    AND et.SemesterID = ?
                JOIN Attendance a ON ei.EventID = a.EventID
                JOIN Semesters s ON ei.TermCode = s.TermCode
                WHERE ei.OrganizationID = ? AND s.SemesterID = ?
                GROUP BY ei.EventID, et.EventType, et.EventTypeID
            ) AS event_rates
            GROUP BY EventTypeID, EventType`,
            [organizationID, semesterID, semesterID, organizationID, semesterID]
        );
        res.json(rows);
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/eventInstanceAttendance', async (req, res) => {
    const { eventTypeID, semesterID, organizationID } = req.query;

    // Validate all required parameters are present
    if (!eventTypeID || !semesterID || !organizationID) {
        return res.status(400).json({
            error: 'Missing required parameters: eventTypeID, semesterID, or organizationID'
        });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                ei.EventID,
                ei.EventTitle,
                ei.EventDate,
                et.EventType,
                COALESCE(COUNT(CASE WHEN a.AttendanceStatus = 'Attended' THEN 1 END), 0) AS attendanceCount
            FROM EventInstances ei
            JOIN EventTypes et ON ei.EventTypeID = et.EventTypeID
            LEFT JOIN Attendance a ON ei.EventID = a.EventID
            JOIN Semesters s ON ei.TermCode = s.TermCode
            WHERE ei.EventTypeID = ?
                AND s.SemesterID = ?
                AND ei.OrganizationID = ?
            GROUP BY ei.EventID, ei.EventTitle, ei.EventDate, et.EventType
            ORDER BY ei.EventDate`,
            [eventTypeID, semesterID, organizationID]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'No event instances found for the specified parameters'
            });
        }

        res.json(rows);
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/overallAttendance', async (req, res) => {
    const { organizationID, semesterID } = req.query;

    if (!organizationID || !semesterID) {
        return res.status(400).json({ error: 'Missing organizationID or semesterID' });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                AVG(attendance_rate) AS overallAttendanceRate
            FROM (
                SELECT 
                    ei.EventID,
                    COALESCE(COUNT(CASE WHEN a.AttendanceStatus = 'Attended' THEN 1 END), 0) / 
                    GREATEST((SELECT COUNT(*) FROM OrganizationMembers WHERE OrganizationID = ? AND SemesterID = ?), 1) AS attendance_rate
                FROM EventInstances ei
                JOIN Attendance a ON ei.EventID = a.EventID
                JOIN Semesters s ON ei.TermCode = s.TermCode
                WHERE ei.OrganizationID = ? AND s.SemesterID = ?
                GROUP BY ei.EventID
            ) AS event_rates`,
            [organizationID, semesterID, organizationID, semesterID]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/membersByMajor', async (req, res) => {
    const { organizationID, semesterID } = req.query;

    if (!organizationID || !semesterID) {
        return res.status(400).json({ error: 'Missing organizationID or semesterID' });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                COALESCE(m.Title, 'No Major') AS major,
                c.Name AS college,
                COUNT(om.MemberID) AS memberCount
            FROM OrganizationMembers om
            JOIN Members mem ON om.MemberID = mem.MemberID
            LEFT JOIN Majors m ON mem.MajorID = m.MajorID
            LEFT JOIN Colleges c ON m.CollegeID = c.CollegeID
            WHERE om.OrganizationID = ? AND om.SemesterID = ?
            GROUP BY m.Title, c.Name
            ORDER BY memberCount DESC`,
            [organizationID, semesterID]
        );
        res.json(rows);
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/eventTypeComparison', async (req, res) => {
    const { organizationID, firstSemesterID, secondSemesterID, eventTypeID } = req.query;

    // Validate all required parameters
    if (!organizationID || !firstSemesterID || !secondSemesterID || !eventTypeID) {
        return res.status(400).json({
            error: 'Missing required parameters: organizationID, firstSemesterID, secondSemesterID, or eventTypeID'
        });
    }

    try {
        // First, get the EventType name from the second semester's EventTypeID
        const [eventTypeInfo] = await db.query(
            `SELECT EventType 
             FROM EventTypes 
             WHERE EventTypeID = ? AND OrganizationID = ? AND SemesterID = ?`,
            [eventTypeID, organizationID, secondSemesterID]
        );

        if (eventTypeInfo.length === 0) {
            return res.status(404).json({
                error: 'Event type not found for the second semester'
            });
        }

        const eventTypeName = eventTypeInfo[0].EventType;

        // Now find the corresponding EventTypeID in the first semester
        const [firstSemesterEventType] = await db.query(
            `SELECT EventTypeID 
             FROM EventTypes 
             WHERE EventType = ? AND OrganizationID = ? AND SemesterID = ?`,
            [eventTypeName, organizationID, firstSemesterID]
        );

        if (firstSemesterEventType.length === 0) {
            return res.status(404).json({
                error: 'Matching event type not found for the first semester'
            });
        }

        const firstSemesterEventTypeID = firstSemesterEventType[0].EventTypeID;
        const secondSemesterEventTypeID = eventTypeID;

        // First query: Get events from first semester
        const [firstSemesterEvents] = await db.query(
            `SELECT 
                ei.EventID,
                ei.EventTitle,
                ei.EventDate,
                s.TermName as semesterName,
                s.SemesterID as semesterID,
                COALESCE(COUNT(CASE WHEN a.AttendanceStatus = 'Attended' THEN 1 END), 0) AS attendanceCount,
                ROW_NUMBER() OVER (ORDER BY ei.EventDate) as eventNumber
            FROM EventInstances ei
            JOIN EventTypes et ON ei.EventTypeID = et.EventTypeID
            LEFT JOIN Attendance a ON ei.EventID = a.EventID
            JOIN Semesters s ON ei.TermCode = s.TermCode
            WHERE ei.EventTypeID = ?
                AND s.SemesterID = ?
                AND ei.OrganizationID = ?
            GROUP BY ei.EventID, ei.EventTitle, ei.EventDate, s.TermName, s.SemesterID
            ORDER BY ei.EventDate`,
            [firstSemesterEventTypeID, firstSemesterID, organizationID]
        );

        // Second query: Get events from second semester
        const [secondSemesterEvents] = await db.query(
            `SELECT 
                ei.EventID,
                ei.EventTitle,
                ei.EventDate,
                s.TermName as semesterName,
                s.SemesterID as semesterID,
                COALESCE(COUNT(CASE WHEN a.AttendanceStatus = 'Attended' THEN 1 END), 0) AS attendanceCount,
                ROW_NUMBER() OVER (ORDER BY ei.EventDate) as eventNumber
            FROM EventInstances ei
            JOIN EventTypes et ON ei.EventTypeID = et.EventTypeID
            LEFT JOIN Attendance a ON ei.EventID = a.EventID
            JOIN Semesters s ON ei.TermCode = s.TermCode
            WHERE ei.EventTypeID = ?
                AND s.SemesterID = ?
                AND ei.OrganizationID = ?
            GROUP BY ei.EventID, ei.EventTitle, ei.EventDate, s.TermName, s.SemesterID
            ORDER BY ei.EventDate`,
            [secondSemesterEventTypeID, secondSemesterID, organizationID]
        );

        // Get semester details for labels
        const [semesterDetails] = await db.query(
            `SELECT SemesterID, TermName 
             FROM Semesters 
             WHERE SemesterID IN (?, ?)`,
            [firstSemesterID, secondSemesterID]
        );

        const semesterLabels = {};
        semesterDetails.forEach(sem => {
            semesterLabels[sem.SemesterID] = sem.TermName;
        });

        // Include eventType name in the response
        const eventTypeLabel = eventTypeName;

        // Organize the data for stacked bar chart comparison
        const maxEvents = Math.max(firstSemesterEvents.length, secondSemesterEvents.length);
        const comparisonData = [];

        for (let i = 0; i < maxEvents; i++) {
            const eventComparison = {
                eventNumber: i + 1,
                firstSemester: i < firstSemesterEvents.length ? {
                    eventID: firstSemesterEvents[i].EventID,
                    eventTitle: firstSemesterEvents[i].EventTitle,
                    eventDate: firstSemesterEvents[i].EventDate,
                    attendanceCount: firstSemesterEvents[i].attendanceCount
                } : null,
                secondSemester: i < secondSemesterEvents.length ? {
                    eventID: secondSemesterEvents[i].EventID,
                    eventTitle: secondSemesterEvents[i].EventTitle,
                    eventDate: secondSemesterEvents[i].EventDate,
                    attendanceCount: secondSemesterEvents[i].attendanceCount
                } : null
            };
            comparisonData.push(eventComparison);
        }

        res.json({
            eventTypeLabel,
            semesterLabels,
            comparisonData
        });

    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/commonEventTypes', async (req, res) => {
    const { organizationID, firstSemesterID, secondSemesterID } = req.query;

    // Validate all required parameters
    if (!organizationID || !firstSemesterID || !secondSemesterID) {
        return res.status(400).json({
            error: 'Missing required parameters: organizationID, firstSemesterID, or secondSemesterID'
        });
    }

    try {
        // Query to find event types that exist in both semesters
        const [rows] = await db.query(
            `SELECT 
                et1.EventTypeID AS firstSemesterEventTypeID,
                et2.EventTypeID AS secondSemesterEventTypeID,
                et1.EventType,
                et1.RuleType,
                et1.MaxPoints,
                et1.MinPoints,
                et1.OccurrenceTotal
            FROM EventTypes et1
            JOIN EventTypes et2 
                ON et1.EventType = et2.EventType 
                AND et1.OrganizationID = et2.OrganizationID
            WHERE et1.OrganizationID = ?
                AND et1.SemesterID = ?
                AND et2.SemesterID = ?
            ORDER BY et1.EventType`,
            [organizationID, firstSemesterID, secondSemesterID]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'No common event types found between the specified semesters'
            });
        }

        // Get semester names for better context in the response
        const [semesterDetails] = await db.query(
            `SELECT SemesterID, TermName 
             FROM Semesters 
             WHERE SemesterID IN (?, ?)`,
            [firstSemesterID, secondSemesterID]
        );

        const semesterLabels = {};
        semesterDetails.forEach(sem => {
            semesterLabels[sem.SemesterID] = sem.TermName;
        });

        res.json({
            semesterLabels: {
                firstSemester: semesterLabels[firstSemesterID],
                secondSemester: semesterLabels[secondSemesterID]
            },
            commonEventTypes: rows
        });

    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/genderRaceTallies', async (req, res) => {
    const { organizationID, semesterID } = req.query;

    if (!organizationID || !semesterID) {
        return res.status(400).json({
            error: 'Missing required parameters: organizationID and semesterID'
        });
    }

    try {
        // Tally for genders: count distinct members grouped by gender
        const [genderRows] = await db.query(
            `SELECT 
                m.Gender, 
                COUNT(DISTINCT m.MemberID) AS count
            FROM OrganizationMembers om
            JOIN Members m ON om.MemberID = m.MemberID
            WHERE om.OrganizationID = ? AND om.SemesterID = ?
            GROUP BY m.Gender`,
            [organizationID, semesterID]
        );

        // Tally for races: count distinct members grouped by race
        const [raceRows] = await db.query(
            `SELECT 
                m.Race, 
                COUNT(DISTINCT m.MemberID) AS count
            FROM OrganizationMembers om
            JOIN Members m ON om.MemberID = m.MemberID
            WHERE om.OrganizationID = ? AND om.SemesterID = ?
            GROUP BY m.Race`,
            [organizationID, semesterID]
        );

        res.json({
            genders: genderRows,
            races: raceRows
        });
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/membersByGraduation', async (req, res) => {
    console.log('Received request at /membersByGraduation');
    const { organizationID, semesterID } = req.query;

    if (!organizationID || !semesterID) {
        return res.status(400).json({ error: 'Missing required parameters: organizationID and semesterID' });
    }
    
    try {
        // Get the semester record to extract the end date (used to determine graduation year)
        const [semesterRows] = await db.query(
            `SELECT EndDate FROM Semesters WHERE SemesterID = ?`,
            [semesterID]
        );
        
        if (semesterRows.length === 0) {
            return res.status(404).json({ error: 'Semester not found' });
        }
        
        // Extract the year from the EndDate (assumes EndDate is in YYYY-MM-DD format)
        const endDate = new Date(semesterRows[0].EndDate);
        const graduationYear = endDate.getFullYear();

        console.log(`Graduation Year: ${graduationYear}`);
        
        // Query OrganizationMembers joined with Members where the member's GraduationYear matches
        const [memberRows] = await db.query(
            `SELECT m.*
             FROM OrganizationMembers om
             JOIN Members m ON om.MemberID = m.MemberID
             WHERE om.OrganizationID = ?
               AND om.SemesterID = ?
               AND m.GraduationYear = ?`,
            [organizationID, semesterID, graduationYear]
        );
        
        res.json(memberRows);
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;