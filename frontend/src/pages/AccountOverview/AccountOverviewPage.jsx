import * as React from 'react';
import {
    Container, Typography, Table,
    TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box,
    Skeleton, List, ListItem, Divider,
} from "@mui/material";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RouteIcon from '@mui/icons-material/Route';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

// We are continuing to use the frontend calculation here 
// as a sort of validation against the backend calculation and db storage

// TODO: Normalize this style for modals and house it somewhere else
const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    width: { xs: '90%', sm: '500px', md: '900px' },
    maxWidth: '100%',
    maxHeight: '95%',
};

// Helper function to generate rule descriptions
function generateRuleDescription(rule, ruleType) {
    const { criteria, criteriaValue, pointValue } = rule;

    switch (ruleType) {
        case 'criteria':
            switch (criteria) {
                case 'minimum threshold percentage':
                    const percentage = criteriaValue * 100;
                    return `attend at least ${percentage}% of events`;
                case 'one off':
                    return `attend at least one event`;
            }
            break;
        case 'points':
            switch (criteria) {
                case 'attendance':
                    return `+${pointValue} point${pointValue !== 1 ? 's' : ''} per attendance`;
                case 'minimum threshold percentage':
                    const percentage = criteriaValue * 100;
                    return `+${pointValue} point${pointValue !== 1 ? 's' : ''} for ${percentage}% attendance`;
                case 'minimum threshold hours':
                    return `+${pointValue} point${pointValue !== 1 ? 's' : ''} for ${criteriaValue} hour${criteriaValue !== 1 ? 's' : ''} volunteered`;
                case 'one off':
                    return `+${pointValue} point${pointValue !== 1 ? 's' : ''} for first attendance`;
            }
    }
    return 'No rules available'; // Default fallback
}

// Updated calculateProgress function
const calculateProgress = (eventType, rules, occurrenceTotal, userAttendance, requirementType) => {
    const safeAttendance = Array.isArray(userAttendance) ? userAttendance : [];
    const attendedEvents = safeAttendance.filter(event => event.eventType === eventType);
    const attendedCount = attendedEvents.length;
    const totalHours = attendedEvents.reduce((sum, event) => sum + (event.hours || 0), 0); // Sum hours if available
    let points = 0;
    const safeOccurrenceTotal = occurrenceTotal || 0; // Handle null case

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
            description: description || `+${pointValue} point for ${criteria}`,
            value: pointValue,
            isMet,
            progress,
            criteria,
            criteriaValue
        };
    });

    return {
        attended: attendedCount,
        total: safeOccurrenceTotal,
        points,
        progressDetails,
        totalHours
    };
};

const AccountOverview = ({ orgID, memberID, activeRequirement, requirementType, userAttendance, statusObject }) => {
    const [memberName, setMemberName] = React.useState('');
    const [orgRules, setOrgRules] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!memberID) return;
        fetch(`/api/memberDetails/name?memberID=${memberID}`)
            .then(response => response.json())
            .then(data => setMemberName(data))
            .catch(error => console.error('Error fetching data for MemberName:', error));
    }, [memberID]);

    React.useEffect(() => {
        fetch(`/api/organizationRules/eventRules?organizationID=${orgID}`)
            .then(response => response.json())
            .then(data => {
                setOrgRules(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data for OrganizationRules:', error);
                setLoading(false); // Stop loading even on error
            });
    }, [orgID]);

    const safeUserAttendance = Array.isArray(userAttendance) ? userAttendance : [];

    const progressByType = React.useMemo(() => {
        if (!orgRules?.eventTypes) return [];
        return orgRules.eventTypes.map(eventType => {
            const progress = calculateProgress(eventType.name, eventType.rules, eventType.occurrenceTotal, safeUserAttendance, requirementType);
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
        <Container>
            <Paper sx={style}>
                <Box sx={{ overflowY: 'auto', p: 4 }}>
                    {/* Basic Info */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h5">
                            Account Overview - {orgID === 2 ? ' COMS' : ' WiC'}
                        </Typography>
                        {loading ? (
                            <>
                                <Skeleton variant="text" width={100} height={30} sx={{ ml: 1 }} />
                            </>
                        ) : (
                            <>
                                <Typography variant="h6">
                                    {memberName.fullName || 'Loading...'}
                                </Typography>
                            </>
                        )}
                    </Box>

                    {/* Member Overview Container */}
                    <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PeopleAltIcon />
                            <Typography variant="h5">Member Metrics</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-around', overflowX: 'auto' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Typography variant="h5">Status</Typography>
                                <Typography
                                    variant="h5"
                                    sx={{ color: statusObject.status === 'inactive' ? 'red' : statusObject.status ? 'green' : 'system' }}
                                >
                                    {statusObject.status || 'no status'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid #CBCBCB', pl: 2 }}>
                                <Typography variant="h5">
                                    {requirementType === 'points' ? 'Points Earned' : requirementType === 'criteria' ? 'Requirements Met' : 'Active Points'}
                                </Typography>
                                <Typography variant="h5" >
                                    {statusObject.totalPoints || 0} / {activeRequirement || 0}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid #CBCBCB', pl: 2 }}>
                                <Typography variant="h5">Events Attended</Typography>
                                <Typography variant="h5">
                                    {safeUserAttendance.length || 'No events attended'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Path and Past Events Container */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        {/* Active Path */}
                        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '55%' }, height: '390px', borderRadius: 2, p: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                                    <RouteIcon />
                                    <Typography variant="h5">Active Path</Typography>
                                </Box>
                                <Typography variant="h7" sx={{ ml: 4, mb: 1 }}>
                                    {requirementType === 'points' ? `earn ${activeRequirement} points by attending events` : `meet ${activeRequirement} criteria by attending events`}
                                </Typography>
                            </Box>
                            <Box sx={{ overflowY: 'auto' }}>
                                {loading ? (
                                    <>
                                        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3, m: 1 }} />
                                        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3, m: 1 }} />
                                        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3, m: 1 }} />
                                    </>
                                ) : progressByType.length > 0 ? (
                                    <List disablePadding>
                                        {progressByType.map((eventType, index) => (
                                            <React.Fragment key={index}>
                                                <ListItem sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                                    <Typography variant="h6">{eventType.name}s</Typography>
                                                    <Typography>{eventType.progress?.progressDetails[0]?.progress || '0/0'} attended</Typography>
                                                </ListItem>
                                                {eventType.progress?.progressDetails.map((rule, ruleIndex) => (
                                                    <ListItem key={ruleIndex} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{ width: 24, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                                                {rule.criteria === "minimum threshold hours" ? (
                                                                    rule.isMet && rule.criteriaValue === eventType.highestAchievedTier ? (
                                                                        <DoneIcon sx={{ color: 'green' }} />
                                                                    ) : rule.isMet ? (
                                                                        <HorizontalRuleIcon sx={{ color: 'green', fontSize: 'small' }} />
                                                                    ) : (
                                                                        <CloseIcon sx={{ color: '#757575' }} />
                                                                    )

                                                                ) : (
                                                                    rule.isMet ? <DoneIcon sx={{ color: 'green' }} /> : <CloseIcon sx={{ color: '#757575' }} />
                                                                )}
                                                            </Box>
                                                            <Typography>{rule.description}</Typography>
                                                        </Box>

                                                        {rule.criteria === "minimum threshold hours" && rule.isMet && rule.criteriaValue === eventType.highestAchievedTier ? (
                                                            <Typography sx={{ color: 'green' }}>
                                                                {`+${rule.value}`}
                                                            </Typography>
                                                        ) : (
                                                            rule.criteria !== "minimum threshold hours" && requirementType === 'points' && (
                                                                <Typography sx={{ color: rule.isMet ? 'green' : 'black' }}>
                                                                    {`+${rule.isMet ? rule.value : 0}`}
                                                                </Typography>
                                                            )
                                                        )}
                                                    </ListItem>
                                                ))}
                                                {index < progressByType.length - 1 && <Divider sx={{ my: 1 }} />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography sx={{ p: 1 }}>No rules available.</Typography>
                                )}
                            </Box>
                        </Paper>

                        {/* Attendance History Container */}
                        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '45%' }, height: '390px', borderRadius: 2, p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <EventAvailableIcon />
                                <Typography variant="h5">Attendance History</Typography>
                            </Box>
                            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 370 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {safeUserAttendance.length > 0 ? (
                                            safeUserAttendance.map((record, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{record.eventType} {record.hours ? `- ${record.hours} hours` : ''}</TableCell>
                                                    <TableCell>{record.eventDate}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">No attendance records found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default AccountOverview;