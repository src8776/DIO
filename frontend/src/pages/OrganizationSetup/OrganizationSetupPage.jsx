import * as React from 'react';
import {
    Box, Container, InputLabel, MenuItem,
    FormControl, Modal, Paper, Select, TextField,
    Typography, Button, IconButton, List, ListItem,
    ListItemText, ListSubheader,
    ListItemButton
} from '@mui/material';
import { Table, TableBody, TableHead, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import NavColumn from '../../components/NavColumn';
import AddRuleModal from '../../components/AddRuleModal';
import EventItem from './EventItem';
import ActiveModal from './ActiveModal';
import RuleListItem from './RuleListItem';


// TODO: All table items will need to come from the database
// TODO: Form validation (only accept numbers for point values/percentages)
// TODO: implement "save changes" buttons to update values in database
// TODO: user feedback "changes saved successfully"
// TODO: Formatting


// const orgRules = {
//     "organizations": [
//         {
//             "name": "COMS",
//             "activeMembershipRequirement": {
//                 "type": "points",
//                 "value": 18
//             },
//             "eventTypes": [
//                 {
//                     "name": "General Meetings / Saturday Workshops",
//                     "rules": [
//                         {
//                             "id": "coms_general_attendance",
//                             "description": "1 point per general meeting/saturday workshop attended",
//                             "points": 1,
//                             "criteria": "per attendance"
//                         },
//                         {
//                             "id": "coms_general_bonus_50",
//                             "description": "Extra 1 point if attended at least 50% of general meetings",
//                             "points": 1,
//                             "threshold": 50,
//                             "type": "percentage_bonus"
//                         },
//                         {
//                             "id": "coms_general_bonus_75",
//                             "description": "Extra 2 points if attended at least 75% of general meetings",
//                             "points": 2,
//                             "threshold": 75,
//                             "type": "percentage_bonus"
//                         },
//                         {
//                             "id": "coms_general_bonus_100",
//                             "description": "Extra 3 points if attended 100% of general meetings",
//                             "points": 3,
//                             "threshold": 100,
//                             "type": "percentage_bonus"
//                         }
//                     ]
//                 },
//                 {
//                     "name": "Committee Meetings",
//                     "rules": [
//                         {
//                             "id": "coms_committee_attendance",
//                             "description": "1 point per committee meeting attended",
//                             "points": 1,
//                             "criteria": "per attendance"
//                         },
//                         {
//                             "id": "coms_committee_bonus_50",
//                             "description": "Extra 2 points if attended at least 50% of committee meetings",
//                             "points": 2,
//                             "threshold": 50,
//                             "type": "percentage_bonus"
//                         },
//                         {
//                             "id": "coms_committee_bonus_100",
//                             "description": "Extra 3 points if attended 100% of committee meetings",
//                             "points": 3,
//                             "threshold": 100,
//                             "type": "percentage_bonus"
//                         }
//                     ]
//                 },
//                 {
//                     "name": "Volunteer",
//                     "rules": [
//                         {
//                             "id": "coms_volunteer_1_3",
//                             "description": "1 point for volunteering between 1 and 3 hours",
//                             "points": 1,
//                             "minHours": 1,
//                             "maxHours": 3
//                         },
//                         {
//                             "id": "coms_volunteer_3_6",
//                             "description": "2 points for volunteering between 3 and 6 hours",
//                             "points": 2,
//                             "minHours": 3,
//                             "maxHours": 6
//                         },
//                         {
//                             "id": "coms_volunteer_6_9",
//                             "description": "3 points for volunteering between 6 and 9 hours",
//                             "points": 3,
//                             "minHours": 6,
//                             "maxHours": 9
//                         },
//                         {
//                             "id": "coms_volunteer_9_plus",
//                             "description": "4 points for volunteering 9 or more hours",
//                             "points": 4,
//                             "minHours": 9
//                         }
//                     ]
//                 },
//                 {
//                     "name": "Mentorship Program",
//                     "maxPoints": 9,
//                     "rules": [
//                         {
//                             "id": "coms_mentorship_participation",
//                             "description": "3 points for participating as a mentor or mentee",
//                             "points": 3
//                         },
//                         {
//                             "id": "coms_mentorship_meeting",
//                             "description": "1 point per mentor/mentee meeting",
//                             "points": 1,
//                             "criteria": "per meeting"
//                         }
//                     ]
//                 },
//                 {
//                     "name": "Town Hall Meetings",
//                     "rules": [
//                         {
//                             "id": "coms_townhall",
//                             "description": "2 points per town hall meeting attended",
//                             "points": 2,
//                             "criteria": "per attendance"
//                         }
//                     ]
//                 },
//                 {
//                     "name": "Misc. Events",
//                     "rules": [
//                         {
//                             "id": "coms_helping",
//                             "description": "1 point per instance of helping COMS",
//                             "points": 1,
//                             "criteria": "per instance"
//                         }
//                     ]
//                 }
//             ]
//         },
//         {
//             "name": "WiC",
//             "activeMembershipRequirement": {
//                 "type": "criteria",
//                 "rules": [
//                     {
//                         "id": "wic_general_meetings",
//                         "description": "Attend at least half of the general meetings",
//                         "threshold": 50,
//                         "eventType": "General Meetings"
//                     },
//                     {
//                         "id": "wic_committee_meetings",
//                         "description": "Attend at least half of one specific committee's meetings",
//                         "threshold": 50,
//                         "eventType": "Committee Meetings",
//                         "note": "Only one committee is required"
//                     },
//                     {
//                         "id": "wic_social_event",
//                         "description": "Attend at least one social event",
//                         "minOccurrences": 1,
//                         "eventType": "Social Events"
//                     },
//                     {
//                         "id": "wic_volunteer_event",
//                         "description": "Volunteer for at least one volunteer event",
//                         "minOccurrences": 1,
//                         "eventType": "Volunteer Events"
//                     }
//                 ]
//             },
//             "eventTypes": [
//                 {
//                     "name": "General Meetings",
//                     "rules": [
//                         {
//                             "id": "wic_general_attendance",
//                             "description": "Must attend at least 50% of general meetings",
//                             "threshold": 50,
//                             "criteria": "percentage"
//                         }
//                     ]
//                 },
//                 {
//                     "name": "Committee Meetings",
//                     "rules": [
//                         {
//                             "id": "wic_committee_attendance",
//                             "description": "Must attend at least 50% of one specific committee's meetings",
//                             "threshold": 50,
//                             "criteria": "percentage",
//                             "note": "one specific committee"
//                         }
//                     ]
//                 },
//                 {
//                     "name": "Social Events",
//                     "rules": [
//                         {
//                             "id": "wic_social",
//                             "description": "Must attend at least one social event",
//                             "minOccurrences": 1
//                         }
//                     ]
//                 },
//                 {
//                     "name": "Volunteer Events",
//                     "rules": [
//                         {
//                             "id": "wic_volunteer",
//                             "description": "Must volunteer for at least one event",
//                             "minOccurrences": 1
//                         }
//                     ]
//                 }
//             ]
//         }
//     ]
// };

export default function OrganizationSetup() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // need to grab the organization rules from database
    const [orgRules, setOrgRules] = React.useState([]);

    const COMSRules = orgRules.organizations ? { [orgRules.organizations[0].name]: orgRules.organizations[0] } : {};
    const WiCRules = orgRules.organizations ? { [orgRules.organizations[1].name]: orgRules.organizations[1] } : {};

    React.useEffect(() => {
        fetch('http://localhost:3001/organizationRules/OrganizationSetupPage')
            .then(response => response.json())
            .then(data => {
                const formattedData = formatOrgRules(data);
                setOrgRules(formattedData);
            })
            .catch(error => console.error('Error fetching data for OrganizationRules:', error));
    }, []);

    const formatOrgRules = (data) => {
        const organizations = {};

        data.forEach(rule => {
            if (!organizations[rule.OrganizationID]) {
                organizations[rule.OrganizationID] = {
                    name: rule.Name,
                    activeMembershipRequirement: {
                        type: rule.TrackingType.toLowerCase(),
                        value: rule.ActiveRequirement
                    },
                    eventTypes: []
                };
            }

            const eventType = organizations[rule.OrganizationID].eventTypes.find(event => event.name === rule.EventType);
            if (eventType) {
                eventType.rules.push({
                    id: rule.RequirementID,
                    description: rule.Description,
                    points: rule.PointsPer,
                    criteria: rule.MinRequirement,
                    threshold: rule.PointsPer,
                    type: rule.TrackingType
                });
            } else {
                organizations[rule.OrganizationID].eventTypes.push({
                    name: rule.EventType,
                    rules: [{
                        id: rule.RequirementID,
                        description: rule.Description,
                        points: rule.PointsPer,
                        criteria: rule.MinRequirement,
                        threshold: rule.PointsPer,
                        type: rule.TrackingType
                    }]
                });
            }
        });

        return Object.values(organizations);
    };

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

                {/* RULES CONTAINER */}
                {orgRules.length > 0 ? orgRules.map((org, orgIndex) => (
                    <Paper>
                        <List
                            component="nav"
                            aria-labelledby="nested-list-header"
                            subheader={
                                <Typography variant='h6' sx={{ p: 1, borderBottom: 'solid 2px' }}>{org.name}</Typography>
                            }
                        >
                            {/* First list item is always the organization 'active' rule */}
                            <ListItemButton onClick={handleOpen} sx={{ borderBottom: 'solid 1px'}}>
                                <ListItemText primary={"'Active' requirements"} />
                            </ListItemButton>
                            <Modal open={open} onClose={handleClose}>
                                <Box>
                                <ActiveModal org={org.name} rule={org.activeMembershipRequirement.value} />
                                </Box>
                            </Modal>

                            {org.eventTypes.map((eventObj, index) => (
                                <RuleListItem
                                    key={`rule-${index}`}
                                    {...eventObj}
                                />
                            ))}
                        </List>
                    </Paper>
                )) : (
                    <Typography variant='h6'>Loading...</Typography>
                )}
            </Paper>
        </Container>
    );
}
