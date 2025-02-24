const db = require('../config/db');

class EventInstance {
    // Get EventID for that CSV file based on Selected EventType and Date
    static async getEventID(eventType, checkInDate, organizationID) {
        try {
            const eventDate = checkInDate; // Extract only the date
            console.log(`[@EventInstance] Looking up EventID: EventType = ${eventType}, EventDate = ${eventDate}, OrgID = ${organizationID}`);

            // First, check if the event already exists
            const [existingEvents] = await db.query(
                `SELECT e.EventID 
                 FROM EventInstances e 
                 JOIN EventTypes et 
                 ON e.EventTypeID = et.EventTypeID 
                 WHERE DATE(e.EventDate) = ? 
                 AND et.EventType = ? 
                 AND e.OrganizationID = ?
                 LIMIT 1`,
                [eventDate, eventType, organizationID]
            );

            if (existingEvents.length > 0) {
                console.log(`[@EventInstance] Found existing EventID: ${existingEvents[0].EventID}`);
                return existingEvents[0].EventID; // Return the existing EventID
            }

            console.warn(`[@EventInstance] No EventID found for ${eventType} on ${eventDate}, inserting new event...`);

            // Retrieve EventTypeID first
            const [eventTypeRows] = await db.query(
                `SELECT EventTypeID FROM EventTypes WHERE EventType = ? AND OrganizationID = ? LIMIT 1`,
                [eventType, organizationID]
            );

            if (eventTypeRows.length === 0) {
                console.error(`[@EventInstance] No matching EventTypeID found for ${eventType} under OrgID ${organizationID}`);
                return null;
            }

            const eventTypeID = eventTypeRows[0].EventTypeID;

            // Insert new event instance and return the new EventID
            const [insertResult] = await db.query(
                `INSERT INTO EventInstances (EventDate, EventTypeID, OrganizationID) VALUES (?, ?, ?)`,
                [eventDate, eventTypeID, organizationID]
            );

            console.log(`[@EventInstance] New EventID created: ${insertResult.insertId}`);
            return insertResult.insertId; // Return the newly created EventID

        } catch (error) {
            console.error("[@EventInstance] Error fetching or inserting EventID:", error);
            return null;
        }
    }
}

module.exports = EventInstance;