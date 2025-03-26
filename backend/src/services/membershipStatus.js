/**
 * Processes the points for a given event type based on its configuration and the member's events.
 *
 * @param {Array} events - The list of events for this event type.
 * @param {Object} eventConfig - The configuration for this event type.
 * @returns {number} Total points earned for this event type.
 */
const processEventType = (events, eventConfig) => {
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
    if (eventConfig.occurrenceTotal && rulesByCriteria["minimum threshold percentage"]) {
        const attendancePercentage = events.length / eventConfig.occurrenceTotal;
        // Sort the threshold rules in descending order (highest threshold first).
        const percentageRules = rulesByCriteria["minimum threshold percentage"]
            .slice()
            .sort((a, b) => b.criteriaValue - a.criteriaValue);
        for (const rule of percentageRules) {
            if (attendancePercentage >= rule.criteriaValue) {
                points += rule.pointValue;
                // If you want to only award the highest applicable bonus, uncomment the next line:
                // break;
            }
        }
    }

    // Process "minimum threshold hours": award based on total hours across all events
    if (rulesByCriteria["minimum threshold hours"]) {
        // Calculate total hours volunteered
        const totalHours = events.reduce((sum, event) => sum + (event.hours || 0), 0);
        // Sort rules by threshold in descending order
        const hourRules = rulesByCriteria["minimum threshold hours"]
            .slice()
            .sort((a, b) => b.criteriaValue - a.criteriaValue);
        // Award points for each threshold met
        for (const rule of hourRules) {
            if (totalHours >= rule.criteriaValue) {
                points += rule.pointValue;
                // If you want to only award the highest applicable bonus, uncomment the next line:
                break;
            }
        }
    }

    // Apply the maxPoints cap if defined.
    if (eventConfig.maxPoints !== null) {
        points = Math.min(points, eventConfig.maxPoints);
    }
    
    // console.log(points + " points");
    return points;
}

/**
 * Determines a member's membership status based on attendance data and a modular event configuration.
 *
 * @param {Array} attendanceData - Array of attendance records. Each record is an object:
 *                                 { eventType: string, eventDate: string, hours?: number }
 * @param {Object} config - The configuration object containing an "eventTypes" array.
 * @param {number} requiredPoints - The points required to be considered active.
 * @returns {Object} An object containing:
 *                   - status: "Active" if totalPoints meets/exceeds requiredPoints, otherwise "General"
 *                   - totalPoints: the total points earned
 *                   - breakdown: an object with keys for each event type and their respective points
 */
const determineMembershipStatusModular = (attendanceData, config, requiredPoints) => {
    let totalPoints = 0;
    const breakdown = {};

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
        const pointsForType = processEventType(events, eventConfig);
        breakdown[eventConfig.name] = pointsForType;
        totalPoints += pointsForType;
    });
    console.log(requiredPoints + " required points");
    console.log(totalPoints + " total points");
    const status = totalPoints >= requiredPoints ? "Active" : "General";
    console.log("updated status: " + status)

    return { status, totalPoints, breakdown };
}

module.exports = { processEventType, determineMembershipStatusModular };