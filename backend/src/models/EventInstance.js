const db = require('../config/db');
const Semester = require('./Semester');

class EventInstance {
    // Get EventID for that CSV file based on Selected EventType and Date
    static async getEventID(eventType, checkInDate, organizationID, customEventTitle = '') {
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
            const [semesterRow] = await db.query(
                `SELECT SemesterID FROM Semesters WHERE TermCode = ? LIMIT 1`,
                [termCode]
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
            const [existingEvents] = await db.query(
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
                [eventDate, eventType, organizationID, termCode, finalEventTitle]
            );

            if (existingEvents.length > 0) {
                console.log(`[@EventInstance] Found existing EventID: ${existingEvents[0].EventID}`);
                return existingEvents[0].EventID; // Return the existing EventID
            }

            console.warn(`[@EventInstance] No EventID found for ${eventType} on ${eventDate}, inserting new event...`);

            // Retrieve EventTypeID first - now filtering by SemesterID
            const [eventTypeRows] = await db.query(
                `SELECT EventTypeID FROM EventTypes 
                 WHERE EventType = ? AND OrganizationID = ? AND SemesterID = ? LIMIT 1`,
                [eventType, organizationID, semesterID]
            );

            if (eventTypeRows.length === 0) {
                console.error(`[@EventInstance] No matching EventTypeID found for ${eventType} under OrgID ${organizationID} and SemesterID ${semesterID}`);
                return null;
            }

            const eventTypeID = eventTypeRows[0].EventTypeID;

            // Insert new event instance and return the new EventID
            const [insertResult] = await db.query(
                `INSERT INTO EventInstances (EventDate, TermCode, EventTypeID, OrganizationID, EventTitle) VALUES (?, ?, ?, ?, ?)`,
                [eventDate, termCode, eventTypeID, organizationID, finalEventTitle]
            );

            console.log(`[@EventInstance] New EventID created: ${insertResult.insertId}`);
            return insertResult.insertId; // Return the newly created EventID

        } catch (error) {
            console.error("[@EventInstance] Error fetching or inserting EventID:", error);
            return null;
        }
    }

    static async getNumberOfEventInstances(organizationID, termCode) {
        try {
            const [result] = await db.query(
                `SELECT COUNT(*) as EventCount
                 FROM EventInstances
                 WHERE OrganizationID = ?
                 AND TermCode = ?`,
                [organizationID, termCode]
            );

            return result[0].EventCount;
        } catch (error) {
            console.error("[@EventInstance] Error fetching EventInstance count:", error);
            return null;
        }
    }

    static async updateEventOccurrences(organizationID, semesterID) {
        try {
            // Get the term code for the given semester
            const [semesterRows] = await db.query(
                `SELECT TermCode FROM Semesters WHERE SemesterID = ? LIMIT 1`,
                [semesterID]
            );
            if (semesterRows.length === 0) {
                console.error(`No Semester found for SemesterID: ${semesterID}`);
                return;
            }
            const termCode = semesterRows[0].TermCode;
            
            // Tally the number of EventInstances per EventTypeID for this organization and term
            const [counts] = await db.query(
                `SELECT EventTypeID, COUNT(*) AS total
                 FROM EventInstances
                 WHERE OrganizationID = ? AND TermCode = ?
                 GROUP BY EventTypeID`,
                [organizationID, termCode]
            );
            
            // Update the OccurrenceTotal in the EventTypes table for each EventTypeID in this semester
            for (const row of counts) {
                await db.query(
                    `UPDATE EventTypes
                     SET OccurrenceTotal = ?
                     WHERE EventTypeID = ? 
                       AND OrganizationID = ? 
                       AND SemesterID = ?`,
                    [row.total, row.EventTypeID, organizationID, semesterID]
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