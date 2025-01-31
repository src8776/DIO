import React from 'react';
import { Box, Container, InputLabel, MenuItem, FormControl, Paper, Select, TextField, Typography, Button, IconButton } from '@mui/material';
import { Table, TableHead, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';



// TODO: Form validation (only accept numbers for point values/percentages)

function OrganizationSetup() {

    return (
        <Container sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 2
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Typography variant="h5" sx={{ textAlign: 'left', display: 'inline' }}>
                    Organization Setup -
                </Typography>
                <Typography variant='h6' sx={{ textAlign: 'left', display: 'inline', ml: 1 }}>
                    Computing Organization for Multicultural Students
                </Typography>
            </Box>
            {/* Modifier Tables */}
            <Box component="form" sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                        <Button variant="contained" startIcon={<AddIcon />}>
                            Add Event
                        </Button>
                    </Box>

                    <Paper elevation={1}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                <TableRow>
                                    <TableCell>Event Type</TableCell>
                                    <TableCell>Point Value</TableCell>
                                    <TableCell>Rate</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableRow sx={{ borderBottom: "2px solid #000" }}>
                                <TableCell >General Meeting</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell></TableCell>

                                {/* First Cell (Points) */}
                                <TableCell sx={{ width: "150px" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <TextField sx={{ width: "50px" }} />
                                        <Typography>points</Typography>
                                    </Box>
                                </TableCell>

                                {/* Second Cell (Per Meeting) */}
                                <TableCell sx={{ width: "200px" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <TextField sx={{ width: "50px" }} />
                                        <Typography>per meeting</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </Table>
                    </Paper>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" startIcon={<SaveIcon />}>
                            Save Changes
                        </Button>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper elevation={1}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                <TableRow>
                                    <TableCell>Active Membership Requirements</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableRow>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography>A member must have</Typography>
                                        <TextField sx={{ width: "50px" }} />
                                        <Typography>points to achieve 'active' status.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </Table>
                    </Paper>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" startIcon={<SaveIcon />}>
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </Box>

        </Container>
    );
}

export default OrganizationSetup;