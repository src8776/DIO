const useAccountStatus = (activeReqData, orgRulesData, attendanceData) => {
    let activeRequirement = '';
    let requirementType = '';
    let userAttendance = [];
    let statusObject = {};

    // Process activeRequirement data.
    if (activeReqData.length > 0) {
        activeRequirement = activeReqData[0].ActiveRequirement;
        requirementType = activeReqData[0].Description;
    } else {
        activeRequirement = null;
        requirementType = null;
    }

    // Process organization rules (event types)
    const rules = orgRulesData.eventTypes;

    // Process user's attendance data.
    const attendanceRecords = attendanceData.length > 0 ? attendanceData[0].attendanceRecord : [];
    userAttendance = attendanceRecords || [];

    // Once all data is available, call the algorithm.
    if (rules && attendanceRecords.length > 0 && activeReqData[0]?.ActiveRequirement) {
        const status = determineMembershipStatus(
            attendanceRecords,
            { eventTypes: rules },
            activeReqData[0].ActiveRequirement
        );
        statusObject = status;
    }

    return statusObject;
}

const determineMembershipStatus = (attendanceData, config, requiredPoints) => {
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

    const status = totalPoints >= requiredPoints ? "active" : "inactive";

    return { status, totalPoints, breakdown };
}

module.exports = {useAccountStatus, determineMembershipStatus};