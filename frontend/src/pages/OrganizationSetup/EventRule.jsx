import * as React from 'react';
import { Box, Container, TableCell, TextField, Typography } from '@mui/material';
import PercentRule from './PercentRule';
import HoursRule from './HoursRule';



export default function EventRule({ rule }) {

    return rule.trackType === 'participation' ? (
        // If it is a WiC event, we just care about % of events attended
        <Container>
            <TableCell sx={{ width: "150px" }}>
                <Box>
                    <Typography>At Least</Typography>
                </Box>
            </TableCell>
            <PercentRule minRequirements={rule.minRequirements} />
        </Container>
    ) : (
        // COMS wants points per different thresholds
        <Container>
            <TableCell sx={{ width: "150px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField defaultValue={rule.pointsPer} size="small" sx={{ width: "50px" }} />
                    <Typography>point{rule.pointsPer !== 1 ? 's' : ''}</Typography>
                </Box>
            </TableCell>

            {rule.hours ? (
                <HoursRule hours={rule.hours}/>
            ): (
                <PercentRule minRequirements={rule.minRequirements}/>
            )}
        </Container>
    );
}