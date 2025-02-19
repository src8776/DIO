import * as React from 'react';
import {
    Box, Container,
    Modal, Paper,
    Typography, List,
    ListItemText,
    ListItemButton,
    Skeleton
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
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch(`/api/organizationRules/eventRules?organizationID=${orgID}`)
            .then(response => response.json())
            .then(data => {
                // console.log('Fetched data:', data);
                setOrgRules(data);
                setLoading(false);
            })
            .catch(error => console.error('Error fetching data for OrganizationRules:', error));
    }, [orgID]);

    // Extract the number of rules
    const numberOfRules = orgRules ? orgRules.eventTypes.reduce((acc, eventType) => acc + eventType.rules.length, 0) : 0;

    return (
        <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box component="form" sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', p: 2, gap: 2 }}>
                {/* Header box */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                    <Typography variant="h5" sx={{ textAlign: 'left', display: 'inline' }}>
                        Organization Setup -
                    </Typography>
                    {loading ? (
                        <>
                            <Skeleton variant="text" width={100} height={30} sx={{ ml: 1 }} />
                        </>
                    ) : (
                        <>
                            <Typography variant='h6' sx={{ textAlign: 'left', display: 'inline', ml: 1 }}>
                                {org}
                            </Typography>
                        </>
                    )}
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
                        {loading ? (
                            <Skeleton variant="rectangular" height={50} />
                        ) : (
                            <ListItemButton onClick={handleOpen} sx={{}}>
                                <ListItemText primary={"'Active' Requirements"} />
                            </ListItemButton>
                        )}
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
                        }>
                        {loading ? (
                            [...Array(3)].map((_, index) => (
                                <Skeleton key={index} variant="rectangular" height={50} sx={{ mb: 1 }} />
                            ))
                        ) : (
                            orgRules.eventTypes.map((eventObj, index) => (
                                <EventItem
                                    key={`rule-${index}`}
                                    {...eventObj}
                                    orgID={orgID}
                                />
                            ))
                        )}
                    </List>
                </Paper>
            </Box>
        </Container>
    );
}