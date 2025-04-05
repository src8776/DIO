import * as React from 'react';
import {
    Typography, Paper, Box,
    Skeleton, List, ListItem, Divider,
    Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import RouteIcon from '@mui/icons-material/Route';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * Displays the active path with progress for each event type and its rules.
 */
export default function ActivePath({ progressByType, loading, requirementType, activeRequirement, statusObject }) {

    // Sort event types by number of rules (descending)
    const sortedProgressByType = React.useMemo(() => {
        if (!progressByType || progressByType.length === 0) return [];
        return [...progressByType].sort((a, b) =>
            (b.progress?.progressDetails?.length || 0) - (a.progress?.progressDetails?.length || 0)
        );
    }, [progressByType]);

    return (
        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '55%' }, height: '390px', p: 2 }}>
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
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={60} sx={{ m: 1 }} />)
                ) : sortedProgressByType.length > 0 ? (
                    <>
                        {sortedProgressByType.map((eventType, index) => (
                            <React.Fragment key={index}>
                                <Accordion defaultExpanded={false}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6">{eventType.name}</Typography>
                                            <Typography>{eventType.progress?.progressDetails[0]?.progress || '0/0'} attended</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {eventType.maxPoints !== null && (
                                            <ListItem sx={{ justifyContent: 'flex-start' }}>
                                                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                                                    You can earn up to {eventType.maxPoints} points in this category
                                                </Typography>
                                            </ListItem>
                                        )}
                                        {eventType.progress.progressDetails.map((rule, ruleIndex) => (
                                            <ListItem key={ruleIndex} sx={{ justifyContent: 'space-between', py: 0.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ width: 24, textAlign: 'center' }}>
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
                                                    <Typography> {rule.description} </Typography>
                                                </Box>
                                                {rule.criteria === "minimum threshold hours" && rule.isMet && rule.criteriaValue === eventType.highestAchievedTier ? (
                                                    <Typography sx={{ color: rule.isMet ? 'green' : 'primary' }}>
                                                        {`+${rule.value}`}
                                                    </Typography>
                                                ) : rule.criteria === "attendance" ? (
                                                    <Typography sx={{ color: rule.isMet ? 'green' : 'primary' }}>
                                                        {`+${rule.value * eventType.progress.attended}`}
                                                    </Typography>
                                                ) : (
                                                    rule.criteria !== "minimum threshold hours" && requirementType === 'points' && (
                                                        <Typography sx={{ color: rule.isMet ? 'green' : 'primary' }}>
                                                            {`+${rule.isMet ? rule.value : 0}`}
                                                        </Typography>
                                                    )
                                                )}
                                            </ListItem>
                                        ))}
                                        <ListItem sx={{ justifyContent: 'flex-end', py: 0.5 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color:
                                                        eventType.progress.uncappedPoints > eventType.progress.points
                                                            ? 'red'
                                                            : 'green',
                                                }}
                                            >
                                                {eventType.progress.uncappedPoints > eventType.progress.points
                                                    ? `Points earned: ${statusObject.breakdown && statusObject.breakdown[eventType.name] ? statusObject.breakdown[eventType.name] : 0} (capped from ${eventType.progress.uncappedPoints})`
                                                    : `Points earned: ${statusObject.breakdown && statusObject.breakdown[eventType.name] ? statusObject.breakdown[eventType.name] : 0}`}
                                            </Typography>
                                        </ListItem>
                                    </AccordionDetails>
                                </Accordion>
                                {/* {index < sortedProgressByType.length - 1 && <Divider sx={{ my: 1 }} />} */}
                            </React.Fragment>
                        ))}
                    </>
                ) : (
                    <Typography sx={{ p: 1 }}>No rules available.</Typography>
                )}
            </Box>
        </Paper>
    );
}