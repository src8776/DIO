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

// TODO: All table items will need to come from the database
// TODO: Form validation (only accept numbers for point values/percentages)
// TODO: Add default values for all fields
// TODO: implement "save changes" buttons to update values in database
// TODO: user feedback "changes saved successfully"
// TODO: Formatting


const orgRules_HC = {
    "organizations": [
        {
            "name": "COMS",
            "activeMembershipRequirement": {
                "type": "points",
                "value": 18
            },
            "eventTypes": [
                {
                    "name": "General Meetings / Saturday Workshops",
                    "rules": [
                        {
                            "id": "coms_general_attendance",
                            "description": "1 point per general meeting/saturday workshop attended",
                            "points": 1,
                            "criteria": "per attendance"
                        },
                        {
                            "id": "coms_general_bonus_50",
                            "description": "Extra 1 point if attended at least 50% of general meetings",
                            "points": 1,
                            "threshold": 50,
                            "type": "percentage bonus"
                        },
                        {
                            "id": "coms_general_bonus_75",
                            "description": "Extra 2 points if attended at least 75% of general meetings",
                            "points": 2,
                            "threshold": 75,
                            "type": "percentage bonus"
                        },
                        {
                            "id": "coms_general_bonus_100",
                            "description": "Extra 3 points if attended 100% of general meetings",
                            "points": 3,
                            "threshold": 100,
                            "type": "percentage bonus"
                        }
                    ]
                },
                {
                    "name": "Committee Meetings",
                    "rules": [
                        {
                            "id": "coms_committee_attendance",
                            "description": "1 point per committee meeting attended",
                            "points": 1,
                            "criteria": "per attendance"
                        },
                        {
                            "id": "coms_committee_bonus_50",
                            "description": "Extra 2 points if attended at least 50% of committee meetings",
                            "points": 2,
                            "threshold": 50,
                            "type": "percentage bonus"
                        },
                        {
                            "id": "coms_committee_bonus_100",
                            "description": "Extra 3 points if attended 100% of committee meetings",
                            "points": 3,
                            "threshold": 100,
                            "type": "percentage bonus"
                        }
                    ]
                },
                {
                    "name": "Volunteer",
                    "rules": [
                        {
                            "id": "coms_volunteer_1_3",
                            "description": "1 point for volunteering between 1 and 3 hours",
                            "points": 1,
                            "minHours": 1,
                            "maxHours": 3
                        },
                        {
                            "id": "coms_volunteer_3_6",
                            "description": "2 points for volunteering between 3 and 6 hours",
                            "points": 2,
                            "minHours": 3,
                            "maxHours": 6
                        },
                        {
                            "id": "coms_volunteer_6_9",
                            "description": "3 points for volunteering between 6 and 9 hours",
                            "points": 3,
                            "minHours": 6,
                            "maxHours": 9
                        },
                        {
                            "id": "coms_volunteer_9_plus",
                            "description": "4 points for volunteering 9 or more hours",
                            "points": 4,
                            "minHours": 9
                        }
                    ]
                },
                {
                    "name": "Mentorship Program",
                    "maxPoints": 9,
                    "rules": [
                        {
                            "id": "coms_mentorship_participation",
                            "description": "3 points for participating as a mentor or mentee",
                            "points": 3
                        },
                        {
                            "id": "coms_mentorship_meeting",
                            "description": "1 point per mentor/mentee meeting",
                            "points": 1,
                            "criteria": "per meeting"
                        }
                    ]
                },
                {
                    "name": "Town Hall Meetings",
                    "rules": [
                        {
                            "id": "coms_townhall",
                            "description": "2 points per town hall meeting attended",
                            "points": 2,
                            "criteria": "per attendance"
                        }
                    ]
                },
                {
                    "name": "Misc. Events",
                    "rules": [
                        {
                            "id": "coms_helping",
                            "description": "1 point per instance of helping COMS",
                            "points": 1,
                            "criteria": "per instance"
                        }
                    ]
                }
            ]
        },
        {
            "name": "WiC",
            "activeMembershipRequirement": {
                "type": "criteria",
                "rules": [
                    {
                        "id": "wic_general_meetings",
                        "description": "Attend at least half of the general meetings",
                        "threshold": 50,
                        "eventType": "General Meetings"
                    },
                    {
                        "id": "wic_committee_meetings",
                        "description": "Attend at least half of one specific committee's meetings",
                        "threshold": 50,
                        "eventType": "Committee Meetings",
                        "note": "Only one committee is required"
                    },
                    {
                        "id": "wic_social_event",
                        "description": "Attend at least one social event",
                        "minOccurrences": 1,
                        "eventType": "Social Events"
                    },
                    {
                        "id": "wic_volunteer_event",
                        "description": "Volunteer for at least one volunteer event",
                        "minOccurrences": 1,
                        "eventType": "Volunteer Events"
                    }
                ]
            },
            "eventTypes": [
                {
                    "name": "General Meetings",
                    "rules": [
                        {
                            "id": "wic_general_attendance",
                            "description": "Must attend at least 50% of general meetings",
                            "threshold": 50,
                            "criteria": "percentage"
                        }
                    ]
                },
                {
                    "name": "Committee Meetings",
                    "rules": [
                        {
                            "id": "wic_committee_attendance",
                            "description": "Must attend at least 50% of one specific committee's meetings",
                            "threshold": 50,
                            "criteria": "percentage",
                            "note": "one specific committee"
                        }
                    ]
                },
                {
                    "name": "Social Events",
                    "rules": [
                        {
                            "id": "wic_social",
                            "description": "Must attend at least one social event",
                            "minOccurrences": 1
                        }
                    ]
                },
                {
                    "name": "Volunteer Events",
                    "rules": [
                        {
                            "id": "wic_volunteer",
                            "description": "Must volunteer for at least one event",
                            "minOccurrences": 1
                        }
                    ]
                }
            ]
        }
    ]
};

const COMSRules = orgRules_HC.organizations[0];
const WiCRules = orgRules_HC.organizations[1];



export default function OrganizationSetup() {
    const { org } = useParams(); //"wic" or "coms"
    const orgID = org === 'wic' ? 1 : 2;
    const usedRules = orgID === 1 ? WiCRules : COMSRules;
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // need to grab the organization rules from database
    const [orgRules, setOrgRules] = React.useState();

    React.useEffect(() => {
        fetch(`/api/organizationRules/OrganizationSetupPage?organizationID=${orgID}`)
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
                                <ActiveModal orgID={orgID} rule={usedRules.activeMembershipRequirement.value} />
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
                            />
                        ))}

                    </List>
                </Paper>
            </Paper>
        </Container>
    );
}