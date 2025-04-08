import * as React from 'react';
import {
    Container, Typography,
    Box, Skeleton,
} from "@mui/material";
import MemberMetrics from './MemberMetrics';
import ActivePath from './ActivePath';
import AttendanceHistory from './AttendanceHistory';

/**
 * Generates a human-readable description for a rule based on its type and criteria.
 * @param {Object} rule - The rule object with criteria, criteriaValue, and pointValue.
 * @param {string} ruleType - 'points' or 'criteria' to determine description format.
 * @returns {string} A descriptive string for the rule.
 */
function generateRuleDescription(rule, ruleType) {
    const { criteria, criteriaValue, pointValue } = rule;

    switch (ruleType) {
        case 'criteria':
            switch (criteria) {
                case 'minimum threshold percentage':
                    return `Attend at least ${criteriaValue * 100}% of events`;
                case 'one off':
                    return `attend at least one event`;
                default:
                    return `Complete ${criteria}`;
            }
        case 'points':
            switch (criteria) {
                case 'attendance':
                    return `${pointValue} point${pointValue !== 1 ? 's' : ''} per attendance`;
                case 'minimum threshold percentage':
                    return `${pointValue} point${pointValue !== 1 ? 's' : ''} for ${criteriaValue * 100}% attendance`;
                case 'minimum threshold hours':
                    return `${pointValue} point${pointValue !== 1 ? 's' : ''} for ${criteriaValue} hour${criteriaValue !== 1 ? 's' : ''} volunteered`;
                case 'one off':
                    return `${pointValue} point${pointValue !== 1 ? 's' : ''} for first attendance`;
                default:
                    return `${pointValue} points for ${criteria}`;
            }
        default:
            return 'Unknown rule';
    }
}

/**
 * Calculates progress for an event type based on rules, attendance, and occurrence total.
 * This mirrors backend calculations for validation purposes.
 * @param {string} eventType - The name of the event type.
 * @param {Object[]} rules - Array of rule objects.
 * @param {number|null} occurrenceTotal - Total occurrences of the event type.
 * @param {Object[]} userAttendance - Array of user's attendance records.
 * @param {string} requirementType - 'points' or 'criteria'.
 * @returns {Object} Progress metrics including points, attendance, and rule details.
 */
function calculateProgress(eventType, rules, occurrenceTotal, userAttendance, requirementType, maxPoints) {
    const safeAttendance = Array.isArray(userAttendance) ? userAttendance : [];
    const attendedEvents = safeAttendance.filter(event => event.eventType === eventType);
    const attendedCount = attendedEvents.length;
    const totalHours = attendedEvents.reduce((sum, event) => sum + (event.hours || 0), 0);
    const safeOccurrenceTotal = occurrenceTotal || 0;
    let points = 0;

    const progressDetails = rules.map(rule => {
        let isMet = false;
        let progress = '';
        let description = generateRuleDescription(rule, requirementType);
        const { criteria, criteriaValue, pointValue } = rule;

        switch (criteria) {
            case "attendance":
                points += attendedCount * pointValue;
                isMet = attendedCount > 0;
                progress = `${attendedCount}/${safeOccurrenceTotal}`;
                break;

            case "minimum threshold percentage":
                if (criteriaValue && safeOccurrenceTotal > 0) {
                    const threshold = Math.ceil(safeOccurrenceTotal * criteriaValue);
                    isMet = attendedCount >= threshold;
                    points += isMet ? pointValue : 0;
                    progress = `${attendedCount}/${threshold}`;
                }
                break;

            case "minimum threshold hours":
                isMet = totalHours >= criteriaValue;
                points += isMet ? pointValue : 0;
                progress = `${totalHours} hours`;
                break;

            case "one off":
                isMet = attendedCount > 0;
                points += isMet ? pointValue : 0;
                progress = `${attendedCount}/${safeOccurrenceTotal}`;
                break;

            default:
                progress = 'N/A';
        }

        return {
            description: description || `${pointValue} point for ${criteria}`,
            value: pointValue,
            isMet,
            progress,
            criteria,
            criteriaValue
        };
    });

    // Apply the maxPoints cap if it exists
    const uncappedPoints = points;
    if (maxPoints !== null) {
        points = Math.min(points, maxPoints);
    }

    return { attended: attendedCount, total: safeOccurrenceTotal, uncappedPoints, points, progressDetails, totalHours };
};


/**
 * Main component displaying a member's account overview, including metrics, active path, and attendance history.
 */
const AccountOverview = ({ orgID, memberID, activeRequirement, requirementType, userAttendance, statusObject, semesters, activeSemester }) => {
    const [memberName, setMemberName] = React.useState('');
    const [memberStatus, setMemberStatus] = React.useState('');
    const [orgRules, setOrgRules] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [activeCount, setActiveCount] = React.useState(null);

    // Fetch member name
    React.useEffect(() => {
        if (!memberID) return;
        setLoading(true);
        fetch(`/api/memberDetails/name?memberID=${memberID}`)
            .then(response => response.json())
            .then(data => {
                setMemberName(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching member name:', error);
                setError('Failed to load member details');
                setLoading(false);
            });
    }, [memberID]);

    // Fetch member status
    React.useEffect(() => {
        if (!memberID) return;
        setLoading(true);
        fetch(`/api/memberDetails/status?memberID=${memberID}&organizationID=${orgID}&semesterID=${activeSemester.SemesterID}`)
            .then(response => response.json())
            .then(data => {
                setMemberStatus(data.status);
                console.log("status", data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching member name:', error);
                setError('Failed to load member details');
                setLoading(false);
            });
    }, [memberID]);

    // Fetch organization rules
    React.useEffect(() => {
        fetch(`/api/organizationRules/eventRules?organizationID=${orgID}&semesterID=${activeSemester.SemesterID}`)
            .then(response => response.json())
            .then(data => {
                setOrgRules(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching organization rules:', error);
                setError('Failed to load organization rules');
                setLoading(false);
            });
    }, [orgID]);

    // Fetch active semesters count
    React.useEffect(() => {
        if (!memberID || !orgID) return;
        fetch(`/api/memberDetails/activeSemestersCount?memberID=${memberID}&organizationID=${orgID}`)
            .then(response => response.json())
            .then(data => {
                setActiveCount(data);
            })
            .catch(err => {
                console.error("Error fetching active semesters count:", err);
            });
    }, [memberID, orgID]);

    const safeUserAttendance = Array.isArray(userAttendance) ? userAttendance : [];

    const progressByType = React.useMemo(() => {
        if (!orgRules?.eventTypes) return [];
        return orgRules.eventTypes
            .map(eventType => {
                const progress = calculateProgress(eventType.name, eventType.rules, eventType.occurrenceTotal, safeUserAttendance, requirementType, eventType.maxPoints);
                // Compute the highest achieved tier for "minimum threshold hours" rules
                const metHourRules = progress.progressDetails.filter(
                    detail => detail.criteria === "minimum threshold hours" && detail.isMet
                );
                const highestAchievedTier = metHourRules.length > 0
                    ? Math.max(...metHourRules.map(detail => detail.criteriaValue))
                    : null;
                return {
                    ...eventType,
                    progress,
                    highestAchievedTier
                };
            }).filter(eventType => eventType.rules && eventType.rules.length > 0); // Filter out event types without rules
    }, [orgRules, safeUserAttendance, requirementType]);

    return (
        <Container sx={{ width: '100%', p: 2, overflowY: 'auto' }}>
            {/* Basic Info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                {/* <Typography variant="h5">Account Overview - {orgID === 2 ? 'COMS' : 'WiC'}</Typography> */}
                {loading ? (
                    <Skeleton variant="text" width={100} height={30} />
                ) : (
                    <Typography variant="h6">{activeSemester.TermName}</Typography>
                )}
                <Typography variant="h6">{memberName.fullName || 'Unknown Member'}</Typography>
            </Box>
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            <MemberMetrics
                memberName={memberName}
                memberStatus={memberStatus}
                statusObject={statusObject}
                requirementType={requirementType}
                activeRequirement={activeRequirement}
                userAttendance={userAttendance}
                activeCount={activeCount}
            />

            {/* Path and Past Events Container */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <ActivePath
                    statusObject={statusObject}
                    progressByType={progressByType}
                    loading={loading}
                    requirementType={requirementType}
                    activeRequirement={activeRequirement}
                />
                <AttendanceHistory userAttendance={safeUserAttendance} loading={loading} />
            </Box>
        </Container>
    );
};

export default AccountOverview;