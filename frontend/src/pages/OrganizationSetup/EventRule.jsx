import * as React from 'react';
import { Box, Container, TableCell, TableRow, TextField, Typography } from '@mui/material';
import PercentRule from './PercentRule';

export default function EventRule({
    trackType, minRequirements, pointsPer,
    extraPoints, hours, exceptionAllowed
}) {

    return (
        {
            // If it is a WiC event, we just care about % of events attended
            trackType: 'participation' ? (
                <Container>
                    <TableCell sx={{ width: "150px" }}>
                        <Box>
                            <Typography>At Least</Typography>
                        </Box>
                    </TableCell>
                    <PercentRule minRequirements={minRequirements} />
                </Container>
            ) : (
                // COMS wants points per different thresholds
                <Container>
                    <TextField defaultValue={pointsPer} size="small" sx={{ width: "50px" }} />
                    <Typography>point{pointsPer !== 1 ? 's' : ''}</Typography>
                </Container>
            )
        }
    );
}