import * as React from 'react';
import {
    Typography, Paper, Box,
    Skeleton, ListItem,
    Accordion, AccordionSummary, AccordionDetails,
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
        <Paper
            elevation={2}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1.5,
                maxHeight: '500px',
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, boxShadow: 1, position: 'relative', zIndex: 1, }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RouteIcon />
                    <Typography variant="h5">Active Path</Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ ml: 4, color: 'text.secondary' }}>
                    {requirementType === 'points'
                        ? `Earn ${activeRequirement} points by attending events`
                        : `Meet ${activeRequirement} criteria by attending events`}
                </Typography>
            </Box>
            {/* Content */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton 
                            key={i} 
                            variant="rectangular" 
                            height={60} 
                            sx={{ m: 1 }} 
                        />
                    ))
                ) : sortedProgressByType.length > 0 ? (
                    sortedProgressByType.map((eventType, index) => (
                        <Accordion 
                            key={index}
                            defaultExpanded={false}
                            square
                            sx={{ 
                                borderRadius: 0,
                                '&:before': { display: 'none' } // Removes the default Accordion separator
                            }}
                        >
                            <AccordionSummary 
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ py: 1 }}
                            >
                                <Box sx={{ 
                                    width: '100%', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center' 
                                }}>
                                    <Typography variant="h6">{eventType.name}</Typography>
                                    <Typography variant="body2">
                                        {eventType.progress?.progressDetails[0]?.progress || '0/0'} attended
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ py: 0 }}>
                                {eventType.maxPoints !== null && (
                                    <ListItem sx={{ py: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            You can earn up to {eventType.maxPoints} points in this category
                                        </Typography>
                                    </ListItem>
                                )}
                                {eventType.progress.progressDetails.map((rule, ruleIndex) => (
                                    <ListItem 
                                        key={ruleIndex} 
                                        sx={{ 
                                            py: 0.5,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ width: 24, textAlign: 'center' }}>
                                                {rule.criteria === "minimum threshold hours" ? (
                                                    rule.isMet && rule.criteriaValue === eventType.highestAchievedTier ? (
                                                        <DoneIcon sx={{ color: 'success.main' }} />
                                                    ) : rule.isMet ? (
                                                        <HorizontalRuleIcon sx={{ color: 'success.main', fontSize: 'small' }} />
                                                    ) : (
                                                        <CloseIcon sx={{ color: 'grey.500' }} />
                                                    )
                                                ) : (
                                                    rule.isMet ? 
                                                        <DoneIcon sx={{ color: 'success.main' }} /> : 
                                                        <CloseIcon sx={{ color: 'grey.500' }} />
                                                )}
                                            </Box>
                                            <Typography variant="body2">{rule.description}</Typography>
                                        </Box>
                                        {rule.criteria === "minimum threshold hours" && rule.isMet && rule.criteriaValue === eventType.highestAchievedTier ? (
                                            <Typography color={rule.isMet ? 'success.main' : 'primary.main'}>
                                                {`+${rule.value}`}
                                            </Typography>
                                        ) : rule.criteria === "attendance" ? (
                                            <Typography color={rule.isMet ? 'success.main' : 'primary.main'}>
                                                {`+${rule.value * eventType.progress.attended}`}
                                            </Typography>
                                        ) : (
                                            rule.criteria !== "minimum threshold hours" && requirementType === 'points' && (
                                                <Typography color={rule.isMet ? 'success.main' : 'primary.main'}>
                                                    {`+${rule.isMet ? rule.value : 0}`}
                                                </Typography>
                                            )
                                        )}
                                    </ListItem>
                                ))}
                                <ListItem sx={{ justifyContent: 'flex-end', py: 0.5 }}>
                                    <Typography
                                        variant="body2"
                                        color={eventType.progress.uncappedPoints > eventType.progress.points ? 'error.main' : 'success.main'}
                                    >
                                        {eventType.progress.uncappedPoints > eventType.progress.points
                                            ? `Points earned: ${statusObject.breakdown?.[eventType.name] || 0} (capped from ${eventType.progress.uncappedPoints})`
                                            : `Points earned: ${statusObject.breakdown?.[eventType.name] || 0}`}
                                    </Typography>
                                </ListItem>
                            </AccordionDetails>
                        </Accordion>
                    ))
                ) : (
                    <Typography sx={{ p: 2, color: 'text.secondary' }}>
                        No rules available.
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}