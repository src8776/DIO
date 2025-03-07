import * as React from 'react';
import {
    Typography, Paper, Box,
    Skeleton, List, ListItem, Divider,
} from "@mui/material";
import RouteIcon from '@mui/icons-material/Route';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

/**
 * Displays the active path with progress for each event type and its rules.
 */
export default function ActivePath({ progressByType, loading, requirementType, activeRequirement }) {

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
                ) : progressByType.length > 0 ? (
                    <List disablePadding>
                        {progressByType.map((eventType, index) => (
                            <React.Fragment key={index}>
                                <ListItem sx={{ justifyContent: 'space-between', py: 1 }}>
                                    <Typography variant="h6">{eventType.name}s</Typography>
                                    <Typography>{eventType.progress.attended}/{eventType.progress.total} attended</Typography>
                                </ListItem>
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
                                            <Typography>{rule.description} </Typography>
                                        </Box>

                                        {rule.criteria === "minimum threshold hours" && rule.isMet && rule.criteriaValue === eventType.highestAchievedTier ? (
                                            <Typography sx={{ color: 'green' }}>
                                                {`+${rule.value}`}
                                            </Typography>
                                        ) : rule.criteria === "attendance" ? (
                                            <Typography sx={{ color: 'green' }}>
                                                {`+${rule.value * eventType.progress.attended}`}
                                            </Typography>
                                        ) : (
                                            rule.criteria !== "minimum threshold hours" && requirementType === 'points' && (
                                                <Typography sx={{ color: rule.isMet ? 'green' : 'black' }}>
                                                    {`+${rule.isMet ? (rule.value) : 0}`}
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
    );
}