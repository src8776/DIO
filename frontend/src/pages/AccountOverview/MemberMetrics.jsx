import * as React from 'react';
import { useTheme, Typography, Paper, Box, Divider } from "@mui/material";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

/**
 * MemberMetrics.jsx
 * 
 * This React component displays key metrics related to a member's status, progress, and attendance.
 * It provides an overview of the member's current status, points or criteria progress, and the number
 * of events they have attended. The component dynamically updates based on the provided data.
 * 
 * Key Features:
 * - Displays the member's status with a color-coded label based on their current state.
 * - Shows progress toward meeting points or criteria requirements.
 * - Displays the total number of events attended by the member.
 * - Provides contextual messages based on the member's activity history.
 * 
 * Props:
 * - memberStatus: String representing the member's current status (e.g., "Active", "Exempt").
 * - statusObject: Object containing additional status details, such as total points or criteria met.
 * - requirementType: String indicating the type of requirement (e.g., "points" or "criteria").
 * - activeRequirement: Number representing the total points or criteria required to be active.
 * - userAttendance: Array of attendance records for the member.
 * - activeCount: Object containing details about the member's active semesters.
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * 
 * Functions:
 * - statusColor: Determines the color of the status label based on the member's current status.
 * 
 * @component
 */
export default function MemberMetrics({ memberStatus, statusObject, requirementType, activeRequirement, userAttendance, activeCount }) {
    const safeUserAttendance = Array.isArray(userAttendance) ? userAttendance : [];
    const theme = useTheme();

    const statusColor = (() => {
        switch (memberStatus) {
            case 'Active':
                return `${theme.palette.activeStatus.default}`;
            case 'CarryoverActive':
                return `${theme.palette.activeStatus.default}`;
            case 'Exempt':
                return `${theme.palette.exemptStatus.default}`;
            case 'General':
                return `${theme.palette.generalStatus.default}`;
            default:
                return `${theme.palette.generalStatus.default}`;
        }
    })();

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}>
                    <PeopleAltIcon />
                    <Typography variant="h5">Member Metrics</Typography>
                </Box>
                {/* <Typography variant="h6">{memberName.fullName || 'Unknown Member'}</Typography> */}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-around', overflowX: 'auto' }}>
                <Box>
                    <Typography variant="h6">Status</Typography>
                    <Typography variant="h5" sx={{ color: statusColor }}>
                        {memberStatus ?? 'N/A'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                        {activeCount && activeCount.activeSemesters === '0'
                            ? (requirementType === 'points'
                                ? "Earn points to become active!"
                                : "Meet the criteria to become active!")
                            : `You have been active ${activeCount?.activeSemesters} out of ${activeCount?.totalSemesters} ${activeCount?.totalSemesters > 1 ? 'semesters' : 'semester'}.`
                        }
                    </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                    <Typography variant="h6">{requirementType === 'points' ? 'Points Earned' : 'Criteria Met'}</Typography>
                    <Typography variant="h5">{`${statusObject.totalPoints || 0} / ${activeRequirement || 0}`}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                    <Typography variant="h6">Events Attended</Typography>
                    <Typography variant="h5">{safeUserAttendance.length}</Typography>
                </Box>
            </Box>
        </Paper>
    );
}