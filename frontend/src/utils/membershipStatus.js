/**
 * Processes the points for a given event type based on its configuration and the member's events.
 *
 * @param {Array} events - The list of events for this event type.
 * @param {Object} eventConfig - The configuration for this event type.
 * @returns {number} Total points earned for this event type.
 */
function processEventType(events, eventConfig) {
    let points = 0;
    const rules = eventConfig.rules || [];

    // Group the rules by their criteria.
    const rulesByCriteria = rules.reduce((acc, rule) => {
        const key = rule.criteria;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(rule);
        return acc;
    }, {});

    // Process "attendance": points awarded per event.
    if (rulesByCriteria["attendance"]) {
        const attendancePoint = rulesByCriteria["attendance"]
            .reduce((sum, rule) => sum + rule.pointValue, 0);
        points += events.length * attendancePoint;
    }

    // Process "one off": points awarded only once if there is at least one event.
    if (rulesByCriteria["one off"] && events.length > 0) {
        const oneOffPoints = rulesByCriteria["one off"]
            .reduce((sum, rule) => sum + rule.pointValue, 0);
        points += oneOffPoints;
    }

    // Process "minimum threshold percentage": bonus based on overall attendance.
    // This applies if an OccurrenceTotal is defined.
    if (eventConfig.OccurrenceTotal && rulesByCriteria["minimum threshold percentage"]) {
        const attendancePercentage = events.length / eventConfig.OccurrenceTotal;
        // Sort the threshold rules in descending order (highest threshold first).
        const percentageRules = rulesByCriteria["minimum threshold percentage"]
            .slice()
            .sort((a, b) => b.criteriaValue - a.criteriaValue);
        for (const rule of percentageRules) {
            if (attendancePercentage >= rule.criteriaValue) {
                points += rule.pointValue;
                // UNCOMMENT THIS IF WE ONLY WANT HIGHEST THRESHOLD RULE AWARDED
                // break; // Only the first matching bonus is awarded.
            }
        }
    }

    // Process "minimum threshold hours": for each event (e.g. Volunteer Event) award based on hours.
    if (rulesByCriteria["minimum threshold hours"]) {
        // Sort descending by criteriaValue.
        const hourRules = rulesByCriteria["minimum threshold hours"]
            .slice()
            .sort((a, b) => b.criteriaValue - a.criteriaValue);
        events.forEach(event => {
            const hours = event.hours || 0;
            for (const rule of hourRules) {
                if (hours >= rule.criteriaValue) {
                    points += rule.pointValue;
                    // UNCOMMENT THIS IF WE ONLY WANT HIGHEST THRESHOLD RULE AWARDED
                    //   break; // Award the highest applicable rule per event.
                }
            }
        });
    }

    return points;
}

/**
 * Determines a member's membership status based on attendance data and a modular event configuration.
 *
 * @param {Array} attendanceData - Array of attendance records. Each record is an object:
 *                                 { eventType: string, eventDate: string, hours?: number }
 * @param {Object} config - The configuration object containing an "eventTypes" array.
 * @param {number} requiredPoints - The points required to be considered active.
 * @returns {string} "active" if the total points meet/exceed requiredPoints; otherwise "inactive".
 */
function determineMembershipStatusModular(attendanceData, config, requiredPoints) {
    let totalPoints = 0;

    // Group attendance records by event type.
    const eventsByType = attendanceData.reduce((acc, record) => {
        if (!acc[record.eventType]) {
            acc[record.eventType] = [];
        }
        acc[record.eventType].push(record);
        return acc;
    }, {});

    // Process each event type defined in the config.
    config.eventTypes.forEach(eventConfig => {
        const events = eventsByType[eventConfig.name] || [];
        totalPoints += processEventType(events, eventConfig);
    });

    return totalPoints >= requiredPoints ? "active" : "inactive";
}

/* ===== Example Usage ===== */

// Sample attendance data:
const attendanceData = [
    { eventType: "General Meeting", eventDate: "2025-01-05" },
    { eventType: "General Meeting", eventDate: "2025-01-12" },
    { eventType: "General Meeting", eventDate: "2025-01-19" },
    { eventType: "Committee Meeting", eventDate: "2025-01-08" },
    { eventType: "Committee Meeting", eventDate: "2025-01-15" },
    { eventType: "Volunteer Event", eventDate: "2025-01-10", hours: 4 },
    { eventType: "Volunteer Event", eventDate: "2025-01-17", hours: 2 },
    { eventType: "Mentor Event", eventDate: "2025-01-20" },
    { eventType: "Mentor Event", eventDate: "2025-01-27" },
    { eventType: "Misc. Help", eventDate: "2025-01-30" }
];

// New configuration:
const config = {
    "eventTypes": [
        {
            "name": "General Meeting",
            "ruleType": "Points",
            "OccurrenceTotal": 15,
            "rules": [
                { "criteria": "attendance", "criteriaValue": null, "pointValue": 1 },
                { "criteria": "minimum threshold percentage", "criteriaValue": 0.5, "pointValue": 1 },
                { "criteria": "minimum threshold percentage", "criteriaValue": 0.75, "pointValue": 2 },
                { "criteria": "minimum threshold percentage", "criteriaValue": 1, "pointValue": 3 }
            ]
        },
        {
            "name": "Committee Meeting",
            "ruleType": "Points",
            "OccurrenceTotal": 10,
            "rules": [
                { "criteria": "attendance", "criteriaValue": null, "pointValue": 1 },
                { "criteria": "minimum threshold percentage", "criteriaValue": 0.5, "pointValue": 2 },
                { "criteria": "minimum threshold percentage", "criteriaValue": 1, "pointValue": 3 }
            ]
        },
        {
            "name": "Volunteer Event",
            "ruleType": "Points",
            "OccurrenceTotal": 8,
            "rules": [
                { "criteria": "minimum threshold hours", "criteriaValue": 1, "pointValue": 1 },
                { "criteria": "minimum threshold hours", "criteriaValue": 3, "pointValue": 2 },
                { "criteria": "minimum threshold hours", "criteriaValue": 6, "pointValue": 3 },
                { "criteria": "minimum threshold hours", "criteriaValue": 9, "pointValue": 4 }
            ]
        },
        {
            "name": "Mentor Event",
            "ruleType": "Points",
            "OccurrenceTotal": 5,
            "rules": [
                { "criteria": "one off", "criteriaValue": null, "pointValue": 3 },
                { "criteria": "attendance", "criteriaValue": null, "pointValue": 1 }
            ]
        },
        {
            "name": "Misc. Help",
            "ruleType": "Points",
            "OccurrenceTotal": null,
            "rules": [
                { "criteria": "attendance", "pointValue": 1 }
            ]
        }
    ]
};

// // Define the required points for active membership (for example, 18 points).
// const requiredPoints = 18;

// // Determine membership status.
// const memberStatus = determineMembershipStatusModular(attendanceData, config, requiredPoints);
// console.log("Member Status:", memberStatus); // Outputs "active" or "inactive" based on total points.
