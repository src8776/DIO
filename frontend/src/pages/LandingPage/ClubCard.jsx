import React from "react";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Modal, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import AccountOverview from '../AccountOverview/AccountOverviewPage';
import useAccountStatus from "../../hooks/useAccountStatus";


export default function ClubCard({ memberID, orgID, semesters, activeSemester, onSelectOrg, selected, noneSelected }) {
    const { activeRequirement, requirementType, userAttendance, statusObject } = useAccountStatus(orgID, memberID, activeSemester);
    const [orgAbbreviation, setOrgAbbreviation] = React.useState('');
    const [memberStatus, setMemberStatus] = React.useState(null);
    const [memberRole, setMemberRole] = React.useState('');

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
                // console.log("Member Role Data:", data);
                setMemberRole(data.role || 'No role assigned');
            })
            .catch(error => console.error('Error fetching data for MemberName:', error));
    }, [memberID, orgID]);



    // TODO: Store image paths in database
    const comsInfo = {
        image: "/COMS.png",
        imageFit: "contain",
        title: "Computing Organization for Multicultural Students",
    };

    const wicInfo = {
        image: "/WiC.png",
        imageFit: "contain",
        title: "Women in Computing",
    };

    const clubInfo = orgID === 2 ? comsInfo : wicInfo;

    const handleViewInfo = () => {
        onSelectOrg({
            orgID,
            activeRequirement,
            requirementType,
            userAttendance,
            statusObject,
        });
    };

    return (
        <Card
            elevation={noneSelected ? 1 : (selected ? 5 : 0)}
            sx={{
                width: 350,      // Fixed width
                height: 340,     // Fixed height
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                transform: selected ? "translateX(8px)" : "translateX(0px)",
                transition: 'transform 0.2s ease-in-out',
            }}>
            <CardMedia
                component="img"
                sx={{
                    width: "100%",
                    height: 118,
                    objectFit: clubInfo.imageFit,
                }}
                image={clubInfo.image}
                title={clubInfo.title}
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', borderTop: "1px solid #f0f0f0", }}>
                <Box>
                    <Typography gutterBottom sx={{ color: "text.secondary", fontSize: 14 }}>
                        {orgAbbreviation.toUpperCase()}
                    </Typography>
                    <Typography variant="h5">
                        {clubInfo.title}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {(memberRole === 'Admin' || memberRole === 'Eboard') && (
                        <Typography sx={{ color: "text.secondary" }}>
                            {memberRole}
                        </Typography>
                    )}
                    {(() => {
                        const displayStatus = memberStatus === 'Active' ? 'Active Member'
                            : memberStatus === 'Inactive' ? 'Inactive Member'
                                : 'General Member';
                        const statusColor = memberStatus === 'Active' ? '#2DD4BF'
                            : memberStatus === 'Inactive' ? '#5C6773'
                                : '#7C8796';
                        return (
                            <Typography sx={{ fontWeight: 'bold', color: statusColor }}>
                                {displayStatus}
                            </Typography>
                        );
                    })()}
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={handleViewInfo} aria-label="account overview">
                    View Info
                </Button>
                {(memberRole === 'Admin' || memberRole === 'Eboard') &&
                    <Button component={Link} to={`/admin/${orgAbbreviation}`} variant="contained">
                        Admin Dashboard
                    </Button>
                }
            </CardActions>
        </Card>
    );
}