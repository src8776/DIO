import * as React from 'react';
import {
    Box, Button, Container,
    Modal, Paper, Typography,
    List, ListItemText, ListItemButton,
    Skeleton, Snackbar, Alert,
    Select, MenuItem, Dialog, DialogTitle,
    DialogContent, DialogActions,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import ActiveModal from './ActiveModal';
import EventItem from './EventItem';
import AddEventModal from './AddEventModal';

export default function OrganizationSetup() {
    const { org } = useParams(); //"wic" or "coms"
    const allowedTypes = ['wic', 'coms'];
    const [orgID, setOrgID] = React.useState(null);
    const [selectedSemester, setSelectedSemester] = React.useState(null);
    const [semesters, setSemesters] = React.useState([]);
    const [isEditable, setIsEditable] = React.useState(true);
    const [openCopyDialog, setOpenCopyDialog] = React.useState(false);
    const [sourceSemester, setSourceSemester] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [formOpen, setFormOpen] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState(null);
    const [orgRules, setOrgRules] = React.useState(null);
    const [isFinalized, setIsFinalized] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [openEventID, setOpenEventID] = React.useState(null);
    const MemoizedEventItem = React.memo(EventItem);

    // Modal handlers for ActiveModal
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleFormOpen = () => setFormOpen(true);
    const handleFormClose = () => setFormOpen(false);

    // Handlers for EventItem modals
    const handleOpenModal = (eventTypeID) => {
        setOpenEventID(eventTypeID);
    };

    const handleCloseModal = () => {
        // First set the modal state to closed
        setOpenEventID(null);
        
        // Then refresh event rules data
        if (orgID && selectedSemester) {
            fetchEventRules();
        }
    };

    // Validate org parameter
    if (!allowedTypes.includes(org)) {
        return (
            <Typography component={Paper} variant='h1' sx={{ alignContent: 'center', p: 6, m: 'auto' }}>
                Organization Doesn't Exist
            </Typography>
        );
    }

    // Fetch orgID when org changes
    React.useEffect(() => {
        setLoading(true); // Reset loading state when org changes
        fetch(`/api/organizationInfo/organizationIDByAbbreviation?abbreviation=${org}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    setOrgID(data[0].OrganizationID);
                }
            })
            .catch((error) => {
                console.error('Error fetching orgID:', error);
            });
    }, [org]);

    // Fetch semesters on component mount
    React.useEffect(() => {
        fetch('/api/admin/getSemesters')
            .then((response) => response.json())
            .then((data) => {
                setSemesters(data);
                const activeSemester = data.find(semester => semester.IsActive === 1);
                if (activeSemester) {
                    setSelectedSemester(activeSemester || null);
                }
            })
            .catch((error) => {
                console.error('Error fetching semesters:', error);
            });
    }, []);

    // Fetch isFinalized and set isEditable
    React.useEffect(() => {
        if (orgID && selectedSemester) {
            setLoading(true); // Start loading when fetching critical data
            fetch(`/api/organizationRules/isFinalized?organizationID=${orgID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setIsFinalized(data.isFinalized);
                    setIsEditable(!data.isFinalized); // Editable if not finalized
                    setLoading(false); // Done loading critical data
                })
                .catch((error) => {
                    console.error('Error fetching isFinalized status:', error);
                    setIsEditable(false); // Safe default on error
                    setLoading(false);
                });
        } else {
            setIsEditable(false); // Not editable if no semester selected
        }
    }, [orgID, selectedSemester]);

    // Fetch event rules
    const fetchEventRules = React.useCallback(() => {
        if (orgID && selectedSemester) {
            setLoading(true);
            fetch(`/api/organizationRules/eventRules?organizationID=${orgID}&semesterID=${selectedSemester.SemesterID}`)
                .then((response) => response.json())
                .then((data) => {
                    setOrgRules(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching event rules:', error);
                    setOrgRules(null); // Reset on error
                    setLoading(false);
                });
        }
    }, [orgID, selectedSemester]);

    React.useEffect(() => {
        fetchEventRules();
    }, [fetchEventRules]);

    const handleCloseSnackbar = () => setSuccessMessage(null);

    // Handle semester change
    const handleSemesterChange = (event) => {
        const value = event.target.value;
        const newSemester = semesters.find((sem) => sem.SemesterID === value);
        setSelectedSemester(newSemester);
    };

    // Calculate number of rules safely
    const numberOfRules = orgRules && orgRules.eventTypes
        ? orgRules.eventTypes.reduce((acc, eventType) => acc + eventType.rules.length, 0)
        : 0;

    // Handle copying rules
    const handleCopyRules = () => {
        fetch('/api/organizationRules/copyRules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organizationID: orgID,
                sourceSemesterID: sourceSemester.SemesterID,
                targetSemesterID: selectedSemester.SemesterID,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setSuccessMessage('Rules copied successfully!');
                    fetchEventRules();
                    setOpenCopyDialog(false);
                }
            })
            .catch((error) => console.error('Error copying rules:', error));
    };

    return (
        <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box component="form" sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', p: 2, gap: 2 }}>
                {/* Header */}
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
                    {/* Semester Select */}
                    <Select
                        value={selectedSemester ? selectedSemester.SemesterID : ''}
                        onChange={handleSemesterChange}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Select Semester' }}
                        size="small"
                        sx={{ width: 150 }}
                        renderValue={(value) => (value ? semesters.find((sem) => sem.SemesterID === value)?.TermName : 'Select Semester')}
                    >
                        {semesters.map((sem) => (
                            <MenuItem key={sem.SemesterID} value={sem.SemesterID}>
                                {sem.TermName}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Copy Rules Button */}
                {isEditable && orgRules && orgRules.eventTypes.length === 0 && (
                    <Button variant="outlined" onClick={() => setOpenCopyDialog(true)}>
                        Copy rules from Existing Semester
                    </Button>
                )}

                {!isEditable && selectedSemester && (
                    <Typography>Rules for closed semesters cannot be modified.</Typography>
                )}
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
                                <ActiveModal orgID={orgID} semesterID={selectedSemester?.SemesterID} numberOfRules={numberOfRules} isEditable={isEditable} />
                            </Box>
                        </Modal>
                    </List>
                </Paper>
                {/* Event Rules Table */}
                <Paper>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: 'solid 2px' }}>
                        <Typography variant='h6'>Event Rules</Typography>
                        {isEditable && (
                            <>
                                <Button variant="contained" color="primary" onClick={handleFormOpen}>Add New Event</Button>
                                <AddEventModal
                                    open={formOpen}
                                    onClose={handleFormClose}
                                    orgID={orgID}
                                    refetchEventRules={fetchEventRules}
                                    setSuccessMessage={setSuccessMessage}
                                    semesterID={selectedSemester?.SemesterID}
                                />
                            </>
                        )}
                    </Box>
                    <List component="nav" aria-labelledby="event-types-list">
                        {loading ? (
                            [...Array(3)].map((_, index) => (
                                <Skeleton key={index} variant="rectangular" height={50} sx={{ mb: 1 }} />
                            ))
                        ) : orgRules && orgRules.eventTypes ? (
                            orgRules.eventTypes
                                .sort((a, b) => b.rules.length - a.rules.length)
                                .map((eventObj) => (
                                    <MemoizedEventItem
                                        key={eventObj.eventTypeID}
                                        {...eventObj}
                                        orgID={orgID}
                                        semesterID={selectedSemester?.SemesterID}
                                        isEditable={isEditable}
                                        open={openEventID === eventObj.eventTypeID}
                                        onOpen={() => handleOpenModal(eventObj.eventTypeID)}
                                        onClose={handleCloseModal}
                                    />
                                ))
                        ) : (
                            <Typography>No event rules available.</Typography>
                        )}
                    </List>
                </Paper>
            </Box>

            {/* Copy Rules Dialog */}
            <Dialog open={openCopyDialog} onClose={() => setOpenCopyDialog(false)}>
                <DialogTitle>Copy Rules from Previous Semester</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Copying Rules from:
                    </Typography>
                    <Select
                        fullWidth
                        value={sourceSemester ? sourceSemester.SemesterID : ''}
                        onChange={e => setSourceSemester(semesters.find(sem => sem.SemesterID === e.target.value))}
                    >
                        {semesters
                            .filter(sem => sem.SemesterID !== selectedSemester?.SemesterID)
                            .map(sem => (
                                <MenuItem key={sem.SemesterID} value={sem.SemesterID}>{sem.TermName}</MenuItem>
                            ))}
                    </Select>
                    <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                        Copying Rules to:
                    </Typography>
                    <Select
                        fullWidth
                        value={selectedSemester ? selectedSemester.SemesterID : ''}
                        disabled
                    >
                        {semesters
                            .filter(sem => sem.SemesterID === selectedSemester?.SemesterID)
                            .map(sem => (
                                <MenuItem key={sem.SemesterID} value={sem.SemesterID}>{sem.TermName}</MenuItem>
                            ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCopyDialog(false)}>Cancel</Button>
                    <Button onClick={handleCopyRules} disabled={!sourceSemester}>Copy Rules</Button>
                </DialogActions>
            </Dialog>
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