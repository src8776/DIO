import * as React from 'react';
import { Box, Container, TableCell, TextField, Typography } from '@mui/material';

export default function EventRule({
    minRequirements
}) {
    
    return (
        <Container>
            <TableCell sx={{ width: "200px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {minRequirements === 0 ? (
                        <Typography>per meeting</Typography>
                    ) : minRequirements === 1 ? (
                        <Typography>one attended</Typography>
                    ) : (
                        <>
                            <TextField defaultValue={minRequirements} size="small" sx={{ width: "50px" }} />
                            <Typography>% attended</Typography>
                        </>
                    )}
                </Box>
            </TableCell>
        </Container>
    );
}