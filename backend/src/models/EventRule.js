const db = require("../config/db");

class EventRule {
    static async getEventRulesByOrgAndSemester(organizationID, semesterID) {
        try {
            const query = `
                SELECT 
                    et.EventTypeID,
                    et.EventType,
                    et.RuleType,
                    et.MaxPoints,
                    et.MinPoints,
                    et.OccurrenceTotal,
                    er.RuleID,
                    er.Criteria,
                    er.CriteriaValue,
                    er.PointValue,
                    os.Description AS RequirementType
                FROM EventTypes et
                LEFT JOIN EventRules er 
                    ON et.EventTypeID = er.EventTypeID 
                    AND er.SemesterID = ?
                LEFT JOIN OrganizationSettings os
                    ON et.OrganizationID = os.OrganizationID
                    AND os.SemesterID = ?
                WHERE et.OrganizationID = ? AND (er.SemesterID = ? OR er.SemesterID IS NULL);
            `;
            const [rows] = await db.query(query, [semesterID, semesterID, organizationID, semesterID]);

            // Transform the flat array into a nested structure
            const eventTypesMap = {};

            rows.forEach(row => {
                const eventTypeID = row.EventTypeID;

                if (!eventTypesMap[eventTypeID]) {
                    eventTypesMap[eventTypeID] = {
                        eventTypeID: eventTypeID,
                        name: row.EventType,
                        ruleType: row.RuleType,
                        maxPoints: row.MaxPoints,
                        occurrenceTotal: row.OccurrenceTotal,
                        requirementType: row.RequirementType,
                        rules: []
                    };
                }

                if (row.RuleID) { // Only add rules if they exist
                    eventTypesMap[eventTypeID].rules.push({
                        criteria: row.Criteria,
                        criteriaValue: parseFloat(row.CriteriaValue),
                        pointValue: parseFloat(row.PointValue),
                        ruleID: row.RuleID
                    });
                }
            });

            // Convert the object map to an array
            const formattedResponse = Object.values(eventTypesMap);

            return formattedResponse;
        } catch (error) {
            console.error('Error fetching data for Organization Setup Page:', error);
            throw error;
        }
    }
}

module.exports = EventRule;