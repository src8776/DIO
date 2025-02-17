const db = require('../config/db');

class EventInstance {
    // Get EventID for that CSV file based on Selected EventType and Date
    static async getEventID(eventType, checkInDate, organizationID) {
        try {
            const eventDate = checkInDate; // Extract only the date
            console.log(`[@EventInstance] Looking up EventID: EventType = ${eventType}, EventDate = ${eventDate}, OrgID = ${organizationID}`);

            const [rows] = await db.query(
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

            if (rows.length === 0) {
                console.warn(`[@EventInstance] No EventID found for ${eventType} on ${eventDate}`);
                return null;
            }

            console.log(`[@EventInstance] Found EventID: ${rows[0].EventID}`);
            return rows[0].EventID;
        } catch (error) {
            console.error("[@EventInstance] Error fetching EventID:", error);
            return null;
        }
    }
}

module.exports = EventInstance;