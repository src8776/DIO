import * as React from 'react';
import { Box, Container, InputLabel, MenuItem, FormControl, Modal, Paper, Select, TextField, Typography, Button, IconButton } from '@mui/material';
import { Table, TableHead, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import NavColumn from '../../components/NavColumn';



// TODO: All table items will need to come from the database
// TODO: Form validation (only accept numbers for point values/percentages)
// TODO: Add default values for all fields
// TODO: implement "save changes" buttons to update values in database
// TODO: user feedback "changes saved successfully"
// TODO: Make this work with dark mode
// TODO: Formatting


function OrganizationSetup() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // need to grab the organization rules from database
    const [config, setConfig] = React.useState([]);


    return (
        <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            {/* NavColumn goes away on mobile and links should appear in hamburger menu */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <NavColumn pageTitle="Organization Setup" />
            </Box>

            <Paper component="form" sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', p: 2, gap: 2 }}>
                {/* Header box */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                    <Typography variant="h5" sx={{ textAlign: 'left', display: 'inline' }}>
                        Organization Setup -
                    </Typography>
                    <Typography variant='h6' sx={{ textAlign: 'left', display: 'inline', ml: 1 }}>
                        COMS
                    </Typography>
                </Box>

                {/* FORM CONTAINER */}
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                    {/* First form */}
                    <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', gap: 1 }}>
                        <Paper elevation={1}>
                            <Table>
                                <TableHead sx={{ borderBottom: "2px solid #000" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Event Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Point Value</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                                    </TableRow>
                                </TableHead>
                                {/* loop through organization config */}
                                <TableRow sx={{ borderBottom: "2px solid lightgray" }}>
                                    <TableCell>General Meeting</TableCell>
                                    <TableCell/>
                                    <TableCell/>
                                </TableRow>
                                <TableRow>
                                    <TableCell></TableCell>
                                    {/* First Cell (Points) */}
                                    <TableCell sx={{ width: "150px" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <TextField size="small" sx={{ width: "50px" }} />
                                            <Typography>point(s)</Typography>
                                        </Box>
                                    </TableCell>
                                    {/* Second Cell (Per Meeting) */}
                                    <TableCell sx={{ width: "200px" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography>per meeting</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell></TableCell>
                                    {/* First Cell (Points) */}
                                    <TableCell sx={{ width: "150px" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <TextField sx={{ width: "50px" }} />
                                            <Typography>point(s)</Typography>
                                        </Box>
                                    </TableCell>
                                    {/* Second Cell (Per Meeting) */}
                                    <TableCell sx={{ width: "200px" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <TextField sx={{ width: "50px" }} />
                                            <Typography>% attended</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow sx={{ borderBottom: "2px solid #000" }}>
                                    <TableCell >Volunteering</TableCell>
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
                                            <Typography>-</Typography>
                                            <TextField sx={{ width: "50px" }} />
                                            <Typography>hours</Typography>
                                        </Box>
                                    </TableCell>
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
                                            <Typography>-</Typography>
                                            <TextField sx={{ width: "50px" }} />
                                            <Typography>hours</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </Table>
                        </Paper>
                        {/* button box */}
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Button variant="contained" startIcon={<AddIcon />}>
                                Add Event
                            </Button>
                            <Button variant="contained" startIcon={<SaveIcon />}>
                                Save Changes
                            </Button>
                        </Box>
                    </Box>
                    {/* Second form */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" startIcon={<CloseIcon />} component={Link} to="/">
                            Close
                        </Button>
                    </Box> */}
                        <Paper elevation={1}>
                            <Table>
                                <TableHead>
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
            </Paper>

        </Container>
    );
}

export default OrganizationSetup;