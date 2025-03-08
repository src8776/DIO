import * as React from 'react';
import {
    Box, Button, Container,
    Modal, Paper,
    Typography, List,
    ListItemText,
    ListItemButton, Skeleton,
    Snackbar, Alert
} from '@mui/material';
import { useParams } from 'react-router-dom';
import ActiveModal from './ActiveModal';
import EventItem from './EventItem';
import AddEventModal from './AddEventModal';

// TODO: Form validation
// TODO: user feedback "changes saved successfully"

export default function OrganizationSetup() {
    const { org } = useParams(); //"wic" or "coms"
    const allowedTypes = ['wic', 'coms'];
    const [orgID, setOrgID] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [formOpen, setFormOpen] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState(null);
    const [orgRules, setOrgRules] = React.useState();
    const [loading, setLoading] = React.useState(true);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleFormOpen = () => setFormOpen(true);
    const handleFormClose = () => setFormOpen(false);

    if (!allowedTypes.includes(org)) {
        return <Typography component={Paper} variant='h1' sx={{alignContent: 'center', p: 6, m: 'auto'}}>Organization Doesn't Exist</Typography>;
    }

    React.useEffect(() => {
        setLoading(true); // Reset loading state when org changes
        fetch(`/api/organizationInfo/organizationIDByAbbreviation?abbreviation=${org}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    setOrgID(data[0].OrganizationID); // Assuming API returns array like [1]
                }
            })
            .catch((error) => {
                console.error('Error fetching orgID:', error);
            });
    }, [org]);

    // Function to fetch event rules
    const fetchEventRules = React.useCallback(() => {
        if (orgID !== null) {
            setLoading(true);
            fetch(`/api/organizationRules/eventRules?organizationID=${orgID}`)
                .then((response) => response.json())
                .then((data) => {
                    setOrgRules(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching data for OrganizationRules:', error);
                    setLoading(false);
                });
        }
    }, [orgID]);

    React.useEffect(() => {
        fetchEventRules();
    }, [fetchEventRules]);

    const handleCloseSnackbar = () => setSuccessMessage(null);

    // Extract the number of rules
    const numberOfRules = orgRules ? orgRules.eventTypes.reduce((acc, eventType) => acc + eventType.rules.length, 0) : 0;

    return (
        <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box component="form" sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', p: 2, gap: 2 }}>
                {/* Header box */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
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
                                    {org.toUpperCase()}
                                </Typography>
                            </>
                        )}
                    </Box>
                    {/* TODO: Reflect current semester, need to figure out this system */}
                    <Typography>Spring Semester, 2025</Typography>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: 'solid 2px' }}>
                        <Typography variant='h6'>Event Rules</Typography>
                        <Button variant="contained" color="primary" onClick={handleFormOpen}>Add New Event</Button>
                        <AddEventModal open={formOpen} onClose={handleFormClose} orgID={orgID} refetchEventRules={fetchEventRules} setSuccessMessage={setSuccessMessage} />
                    </Box>
                    <List
                        component="nav"
                        aria-labelledby="event-types-list">
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
                                    refetchEventRules={fetchEventRules}
                                />
                            ))
                        )}
                    </List>
                </Paper>
            </Box>
            {/* Success Snackbar */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}