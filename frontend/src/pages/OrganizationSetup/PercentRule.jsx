import * as React from 'react';
import { Box, Container, TableCell, TextField, Typography } from '@mui/material';

export default function EventRule({minRequirements}) {

    const displayMinRequirement = minRequirements * 100;

    return (
        <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {minRequirements === 0 ? (
                    <Typography>per meeting</Typography>
                ) : minRequirements === 0.1 ? (
                    <Typography>one attended</Typography>
                ) : (
                    <>
                        <TextField defaultValue={displayMinRequirement} size="small" sx={{ width: "50px" }}/>
                        <Typography>% attended</Typography>
                    </>
                )}
            </Box>
        </TableCell>
    );
}