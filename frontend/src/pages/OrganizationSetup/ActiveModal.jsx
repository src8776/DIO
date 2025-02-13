import * as React from 'react';
import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableHead, TextField, Typography } from '@mui/material';

const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    width: { xs: '90%', sm: '500px', md: '600px' },
    maxWidth: '100%',
};


export default function ActiveModal({org, rule}) {

    return (
        <Container >
            <Paper elevation={1} sx={style}>
                <Typography variant="h5">
                    "Active" status requirements
                </Typography>
                {/* Form Elements */}
                <Box component={"form"} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                    <Table>
                        <TableHead>
                            <TableCell><strong>Rule</strong></TableCell>
                            <TableCell><strong>{org == "WiC" ? 'Criteria' : 'Points'}</strong></TableCell>
                        </TableHead>
                        <TableBody>
                            <TableCell>To Achieve 'active' status:</TableCell>
                            <TableCell>{org == "WiC" ? 'Meet all criteria' : `earn ${rule} points`} </TableCell>
                        </TableBody>
                    </Table>
                </Box>

                
            </Paper>
        </Container>

    )
};