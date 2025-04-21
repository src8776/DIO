const db = require('../config/db');
const Semester = require('./Semester');
const DBHelper = require('../utils/DBHelper');

class EventInstance {
    // Get EventID for that CSV file based on Selected EventType and Date
    static async getEventID(eventType, checkInDate, organizationID, customEventTitle = '', connection = null) {
        try {
            const eventDate = checkInDate; // Extract only the date
            console.log(`[@EventInstance] Looking up EventID: EventType = ${eventType}, EventDate = ${eventDate}, OrgID = ${organizationID}`);

            // Check if Semester exists for the given checkInDate
            const termCode = await Semester.getOrCreateTermCode(checkInDate);
            if (!termCode) {
                console.error(`[@EventInstance] Failed to get or create Semester for checkInDate: ${checkInDate}`);
                return null;
            }
            console.log(`[@EventInstance] Looking up EventID for: ${eventType} on ${checkInDate}, OrgID: ${organizationID}, TermCode: ${termCode}`);

            // Get SemesterID from TermCode
            const [semesterRow] = await DBHelper.runQuery(
                `SELECT SemesterID FROM Semesters WHERE TermCode = ? LIMIT 1`,
                [termCode], connection
            );

            if (semesterRow.length === 0) {
                console.error(`[@EventInstance] No SemesterID found for TermCode: ${termCode}`);
                return null;
            }

            const semesterID = semesterRow[0].SemesterID;

            // Determine the event title
            const finalEventTitle = (customEventTitle || '').trim() ||
                `${eventType} on ${new Date(checkInDate.split(' ')[0] + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;

            // First, check if the event already exists
            const [existingEvents] = await DBHelper.runQuery(
                `SELECT e.EventID 
                 FROM EventInstances e 
                 JOIN EventTypes et 
                 ON e.EventTypeID = et.EventTypeID 
                 WHERE DATE(e.EventDate) = ? 
                 AND et.EventType = ? 
                 AND e.OrganizationID = ?
                 AND e.TermCode = ?
                 AND e.EventTitle = ?
                 LIMIT 1`,
                [eventDate, eventType, organizationID, termCode, finalEventTitle], connection
            );

            if (existingEvents.length > 0) {
                console.log(`[@EventInstance] Found existing EventID: ${existingEvents[0].EventID}`);
                return existingEvents[0].EventID; // Return the existing EventID
            }

            console.warn(`[@EventInstance] No EventID found for ${eventType} on ${eventDate}, inserting new event...`);

            // Retrieve EventTypeID first - now filtering by SemesterID
            const [eventTypeRows] = await DBHelper.runQuery(
                `SELECT EventTypeID FROM EventTypes 
                 WHERE EventType = ? AND OrganizationID = ? AND SemesterID = ? LIMIT 1`,
                [eventType, organizationID, semesterID], connection
            );

            if (eventTypeRows.length === 0) {
                console.error(`[@EventInstance] No matching EventTypeID found for ${eventType} under OrgID ${organizationID} and SemesterID ${semesterID}`);
                return null;
            }

            const eventTypeID = eventTypeRows[0].EventTypeID;

            // Insert new event instance and return the new EventID
            const [insertResult] = await DBHelper.runQuery(
                `INSERT INTO EventInstances (EventDate, TermCode, EventTypeID, OrganizationID, EventTitle) VALUES (?, ?, ?, ?, ?)`,
                [eventDate, termCode, eventTypeID, organizationID, finalEventTitle], connection
            );

            console.log(`[@EventInstance] New EventID created: ${insertResult.insertId}`);
            return insertResult.insertId; // Return the newly created EventID

        } catch (error) {
            console.error("[@EventInstance] Error fetching or inserting EventID:", error);
            return null;
        }
    }

    static async getNumberOfEventInstances(organizationID, termCode, connection = null) {
        try {
            const [result] = await DBHelper.runQuery(
                `SELECT COUNT(*) as EventCount
                 FROM EventInstances
                 WHERE OrganizationID = ?
                 AND TermCode = ?`,
                [organizationID, termCode], connection
            );

            return result[0].EventCount;
        } catch (error) {
            console.error("[@EventInstance] Error fetching EventInstance count:", error);
            return null;
        }
    }

    static async updateEventOccurrences(organizationID, termCode, semesterID, connection = null) {
        try {
            // Reset OccurrenceTotal to 0 for all event types for this organization and semester
            await DBHelper.runQuery(
                `UPDATE EventTypes
                 SET OccurrenceTotal = 0
                 WHERE OrganizationID = ? AND SemesterID = ?`,
                [organizationID, semesterID], connection
            );

            // Tally the number of EventInstances per EventTypeID for this organization and term
            const [counts] = await DBHelper.runQuery(
                `SELECT EventTypeID, COUNT(*) AS total
                 FROM EventInstances
                 WHERE OrganizationID = ? AND TermCode = ?
                 GROUP BY EventTypeID`,
                [organizationID, termCode], connection
            );

            // Update the OccurrenceTotal in the EventTypes table for each EventTypeID in this semester
            for (const row of counts) {
                await DBHelper.runQuery(
                    `UPDATE EventTypes
                     SET OccurrenceTotal = ?
                     WHERE EventTypeID = ? 
                       AND OrganizationID = ? 
                       AND SemesterID = ?`,
                    [row.total, row.EventTypeID, organizationID, semesterID], connection
                );
            }
            console.log(`Updated occurrence totals for EventTypes in Organization ${organizationID} for SemesterID ${semesterID}`);
        } catch (error) {
            console.error("[@EventInstance] Error updating event occurrence totals:", error);
            throw error;
        }
    }
}

module.exports = EventInstance;