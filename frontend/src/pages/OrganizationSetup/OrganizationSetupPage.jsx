import * as React from 'react';
import {
    Box, Container, InputLabel, MenuItem,
    FormControl, Modal, Paper, Select, TextField,
    Typography, Button, IconButton, List, ListItem,
    ListItemText, ListSubheader,
    ListItemButton
} from '@mui/material';
import { useParams } from 'react-router-dom';
import ActiveModal from './ActiveModal';
import EventItem from './EventItem';

// TODO: Form validation (only accept numbers for point values/percentages)
// TODO: implement "save changes" buttons to update values in database
// TODO: user feedback "changes saved successfully"
// TODO: Formatting


export default function OrganizationSetup() {
    const { org } = useParams(); //"wic" or "coms"
    const orgID = org === 'wic' ? 1 : 2;
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // need to grab the organization rules from database
    const [orgRules, setOrgRules] = React.useState();


    React.useEffect(() => {
        fetch(`/api/organizationRules/eventRules?organizationID=${orgID}`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data);
                setOrgRules(data);
            })
            .catch(error => console.error('Error fetching data for OrganizationRules:', error));
    }, [orgID]);

    if (!orgRules) {
        return <div>Loading...</div>;
    }

    // Extract the number of rules
    const numberOfRules = orgRules.eventTypes.reduce((acc, eventType) => acc + eventType.rules.length, 0);


    return (
        <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>


            <Paper component="form" sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', p: 2, gap: 2 }}>
                {/* Header box */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                    <Typography variant="h5" sx={{ textAlign: 'left', display: 'inline' }}>
                        Organization Setup -
                    </Typography>
                    <Typography variant='h6' sx={{ textAlign: 'left', display: 'inline', ml: 1 }}>
                        {org}
                    </Typography>
                </Box>

                {/* RULES CONTAINER */}
                {/* Organization Rules Table */}
                <Paper>
                    <List
                        component="nav"
                        aria-labelledby="nested-list-header"
                        subheader={
                            <Typography variant='h6' sx={{ p: 1, borderBottom: 'solid 2px' }}>Organization Rules</Typography>
                        }>
                        <ListItemButton onClick={handleOpen} sx={{}}>
                            <ListItemText primary={"'Active' Requirements"} />
                        </ListItemButton>
                        <Modal open={open} onClose={handleClose}>
                            <Box>
                                <ActiveModal orgID={orgID} numberOfRules={numberOfRules} />
                            </Box>
                        </Modal>
                    </List>
                </Paper>
                {/* Event Rules Table */}
                <Paper>
                    <List
                        component="nav"
                        aria-labelledby="nested-list-header"
                        subheader={
                            <Typography variant='h6' sx={{ p: 1, borderBottom: 'solid 2px' }}>Event Rules</Typography>
                        }
                    >
                        {orgRules.eventTypes.map((eventObj, index) => (
                            <EventItem
                                key={`rule-${index}`}
                                {...eventObj}
                                orgID={orgID}
                            />
                        ))}

                    </List>
                </Paper>
            </Paper>
        </Container>
    );
}