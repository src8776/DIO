import * as React from 'react';
import { Box, Container, TableCell, TextField, Typography } from '@mui/material';
import PercentRule from './PercentRule';
import HoursRule from './HoursRule';



export default function EventRule({
    RuleID, TrackType, MinRequirement, PointsPer, Hours
}) {

    return TrackType === "Participation" ? (
        // If it is a WiC event, we just care about % of events attended
        <>
            <TableCell >
                <Typography>At least</Typography>
            </TableCell>
            <PercentRule minRequirements={MinRequirement} />
        </>
    ) : (
        // COMS wants points per different thresholds

        <>
            <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField defaultValue={PointsPer} size="small" sx={{ width: "50px" }} />
                    <Typography>point{PointsPer !== 1 ? 's' : ''}</Typography>
                </Box>
            </TableCell>

            {Hours ? (
                <HoursRule hours={Hours} />
            ) : (
                <PercentRule minRequirements={MinRequirement} />
            )}
        </>
    );
}