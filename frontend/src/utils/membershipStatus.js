/**
 * Processes the points for a given event type based on its configuration and the member's events.
 *
 * @param {Array} events - The list of events for this event type.
 * @param {Object} eventConfig - The configuration for this event type.
 * @returns {number} Total points earned for this event type.
 */
export function processEventType(events, eventConfig) {
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
export function determineMembershipStatusModular(attendanceData, config, requiredPoints) {
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




