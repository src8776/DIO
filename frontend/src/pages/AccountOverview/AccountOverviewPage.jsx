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

// TODO: Normalize this style for modals and house it somewhere else
const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    gap: 3,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    width: { xs: '90%', sm: '500px', md: '900px' },
    maxWidth: '100%',
    maxHeight: '90%',
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
    const attended = safeAttendance.filter(event => event.eventType === eventType).length;
    let points = 0;
    const progressDetails = rules.map(rule => {
        let isMet = false;
        let progress = '';
        let description = generateRuleDescription(rule, requirementType); // Pass requirementType dynamically

        if (rule.criteria === "minimum threshold percentage" && rule.criteriaValue) {
            const threshold = Math.ceil(occurrenceTotal * rule.criteriaValue);
            isMet = attended >= threshold;
            points += isMet ? rule.pointValue : 0;
            progress = `${attended}/${threshold}`;
        } else if (rule.criteria === "one off") {
            points += attended * rule.pointValue;
            isMet = attended > 0;
            progress = `${attended}/${occurrenceTotal}`;
        }

        return {
            description: description || `+${rule.pointValue} point for ${rule.criteria}`,
            value: rule.pointValue,
            isMet,
            progress
        };
    });
    return { attended, total: occurrenceTotal, points, progressDetails };
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
        return orgRules.eventTypes.map(eventType => ({
            ...eventType,
            progress: calculateProgress(eventType.name, eventType.rules, eventType.OccurrenceTotal, safeUserAttendance, requirementType)
        }));
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
                    <Paper elevation={1} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 3, p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PeopleAltIcon />
                            <Typography variant="h5">Member Overview</Typography>
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
                        <Paper elevation={1} sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '50%' }, height: '390px', borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                                <RouteIcon />
                                <Typography variant="h5">Active Path</Typography>
                            </Box>
                            <Box sx={{ overflowY: 'auto', p: 1 }}>
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
                                                            {rule.isMet ? <DoneIcon sx={{ color: 'green' }} /> : <CloseIcon sx={{ color: '#757575' }} />}
                                                            <Typography>{rule.description}</Typography>
                                                        </Box>
                                                        {requirementType === 'points' && (
                                                            <Typography sx={{ color: rule.isMet ? 'green' : 'black' }}>{`+${rule.isMet ? rule.value : 0}`}</Typography>
                                                        )}                                                    </ListItem>
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
                        <Paper elevation={1} sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '50%' }, height: '390px', borderRadius: 3, p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <EventAvailableIcon />
                                <Typography variant="h5">Attendance History</Typography>
                            </Box>
                            <TableContainer component={Paper} elevation={1} sx={{ maxHeight: 370 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Event</TableCell>
                                            <TableCell>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {safeUserAttendance.length > 0 ? (
                                            safeUserAttendance.map((record, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{record.eventType}</TableCell>
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