import React from "react";
import {
    Box, Button, Card, CardActions,
    CardContent, CardMedia, Typography,
    Collapse
} from "@mui/material";
import { Link } from 'react-router-dom';
import AccountOverview from '../AccountOverview/AccountOverviewPage';
import useAccountStatus from "../../hooks/useAccountStatus";


export default function ClubCard({ memberID, orgID, semesters, activeSemester }) {
    const { activeRequirement, requirementType, userAttendance, statusObject } = useAccountStatus(orgID, memberID, activeSemester);
    const [orgAbbreviation, setOrgAbbreviation] = React.useState('');
    const [memberStatus, setMemberStatus] = React.useState(null);
    const [memberRole, setMemberRole] = React.useState('');
    const [isExpanded, setIsExpanded] = React.useState(false);

    React.useEffect(() => {
        if (!orgID) return;
        fetch(`/api/organizationInfo/abbreviationByOrganizationID?organizationID=${orgID}`)
            .then(response => response.json())
            .then(data => {
                if (data && data[0]) {
                    setOrgAbbreviation(data[0].Abbreviation);
                } else {
                    setOrgAbbreviation('Unknown');
                }
            })
            .catch(error => console.error('Error fetching data for MemberName:', error));
    }, [orgID]);

    React.useEffect(() => {
        if (!memberID || !orgID) return;
        fetch(`/api/memberDetails/status?memberID=${memberID}&organizationID=${orgID}&semesterID=${activeSemester.SemesterID}`)
            .then(response => response.json())
            .then(data => setMemberStatus(data.status || 'No status available'))
            .catch(error => console.error('Error fetching data for MemberName:', error));
    }, [memberID, orgID]);

    React.useEffect(() => {
        if (!memberID || !orgID) return;
        fetch(`/api/memberDetails/role?memberID=${memberID}&organizationID=${orgID}`)
            .then(response => response.json())
            .then(data => {
                setMemberRole(data.role || 'No role assigned');
            })
            .catch(error => console.error('Error fetching data for MemberName:', error));
    }, [memberID, orgID]);

    const comsInfo = {
        image: "/com_logo.png",
        title: "Computing Organization for Multicultural Students",
    };

    const wicInfo = {
        image: "/WiC.png",
        title: "Women in Computing",
    };

    const clubInfo = orgID === 2 ? comsInfo : wicInfo;

    return (
        <Card sx={{
            width: { xs: '100%', sm: '90%' },
            maxWidth: 1000,
            display: 'flex',
            flexDirection: 'column',
            m: { xs: 1, sm: 2 },
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                flexGrow: 1,
                alignItems: { xs: 'center', sm: 'stretch' },
                borderBottom: '1px solid #ccc',
            }}>
                <Box sx={{
                    width: { xs: 80, sm: 118 },
                    height: { xs: 80, sm: 118 },
                    alignSelf: 'center',
                    m: { xs: 1, sm: 2 },
                    backgroundColor: 'white',
                }}>
                    <CardMedia
                        component="img"
                        sx={{
                            width: "100%",
                            height: "100%",
                        }}
                        image={clubInfo.image}
                        title={clubInfo.title}
                    />
                </Box>
                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 1, sm: 2 },
                    textAlign: { xs: 'center', sm: 'left' },
                    p: { xs: 1, sm: 2 },
                }}>
                    {/* Club Info and Buttons */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                        <Typography variant="h5">
                            {clubInfo.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                onClick={() => setIsExpanded(!isExpanded)}
                                aria-label="account overview"
                            >
                                {isExpanded ? 'Hide Overview' : 'Account Overview'}
                            </Button>
                            {(memberRole === 'Admin' || memberRole === 'Eboard') && (
                                <>
                                    <Typography sx={{ color: 'text.secondary' }}>|</Typography>
                                    <Button
                                        component={Link}
                                        to={`/admin/${orgAbbreviation}`}
                                        variant="contained"
                                    >
                                        Admin Dashboard
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                    {/* User Info */}
                </CardContent>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: { xs: 1, sm: 2 },
                    textAlign: 'center',
                }}>
                    {(memberRole === 'Admin' || memberRole === 'Eboard') && (
                        <Typography>
                            {memberRole}
                        </Typography>
                    )}
                    {/* {(() => {
                        const displayStatus = memberStatus === 'Active' ? 'Active Member'
                            : memberStatus === 'Inactive' ? 'Inactive Member'
                                : 'General Member';
                        const statusColor = memberStatus === 'Active' ? '#2DD4BF'
                            : memberStatus === 'Inactive' ? '#5C6773'
                                : '#7C8796';
                        return (
                            <Typography sx={{ color: statusColor }}>
                                {displayStatus}
                            </Typography>
                        );
                    })()} */}
                </Box>
            </Box>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <AccountOverview
                    variant="inline"
                    memberID={memberID}
                    orgID={orgID}
                    activeRequirement={activeRequirement}
                    requirementType={requirementType}
                    userAttendance={userAttendance}
                    statusObject={statusObject}
                    semesters={semesters}
                    activeSemester={activeSemester}
                />
            </Collapse>
        </Card>
    );
}