import * as React from 'react';
import { Box, Container, TableCell, TextField, Typography } from '@mui/material';

export default function EventRule({
    hours
}) {

    // We want the hours argument to provide a lower and upper bound (1-3, 4-6, etc.)
    return (
        <Container>
            <TableCell sx={{ width: "200px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Lower Bound */}
                    <TextField size="small" defaultValue={hours.lower} sx={{ width: "50px" }} />

                    <Typography>-</Typography>

                    {/* Upper Bound */}
                    <TextField size="small" defaultValue={hours.upper} sx={{ width: "50px" }} />
                    <Typography>hours</Typography>
                </Box>
            </TableCell>
        </Container>
    );
}