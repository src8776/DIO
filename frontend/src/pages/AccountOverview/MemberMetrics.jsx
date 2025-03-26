import * as React from 'react';
import { Typography, Paper, Box, Divider } from "@mui/material";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';


/**
 * Displays member metrics such as status, points/requirements, and events attended.
 */
export default function MemberMetrics({ statusObject, requirementType, activeRequirement, userAttendance, memberName }) {
    const safeUserAttendance = Array.isArray(userAttendance) ? userAttendance : [];

    const displayStatus = (() => {
        switch (statusObject.status?.toLowerCase()) {
            case 'active':
                return 'Active';
            case 'inactive':
                return 'Inactive';
            default:
                return 'General';
        }
    })();

    const statusColor = (() => {
        switch (displayStatus) {
            case 'Active':
                return '#2DD4BF';
            case 'Inactive':
                return '#5C6773'; // slightly darker gray than General
            case 'General':
            default:
                return '#7C8796';
        }
    })();

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}>
                    <PeopleAltIcon />
                    <Typography variant="h5">Member Metrics</Typography>
                </Box>
                <Typography variant="h6">{memberName.fullName || 'Unknown Member'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-around', overflowX: 'auto' }}>
                <Box>
                    <Typography variant="h6">Status</Typography>
                    <Typography variant="h5" sx={{ color: statusColor }}>
                        {displayStatus}
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