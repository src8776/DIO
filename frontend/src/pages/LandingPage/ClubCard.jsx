import React from "react";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Modal, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import AccountOverview from '../AccountOverview/AccountOverviewPage';
import useAccountStatus from "../../hooks/useAccountStatus";


export default function ClubCard({ memberID, orgID, semesters, activeSemester }) {
    const { activeRequirement, requirementType, userAttendance, statusObject } = useAccountStatus(orgID, memberID, activeSemester);
    const [orgAbbreviation, setOrgAbbreviation] = React.useState('');
    const [memberStatus, setMemberStatus] = React.useState(null);
    const [memberRole, setMemberRole] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

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
        fetch(`/api/memberDetails/role?memberID=${memberID}&organizationID=${orgID}&semesterID=${activeSemester.SemesterID}`)
            .then(response => response.json())
            .then(data => setMemberRole(data.role || 'No role assigned'))
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

    return (
        <Card sx={{ width: 350, display: "flex", flexDirection: "column", height: 340 }}>
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
                    {/* This will need to come from the user object Admin, Active, Member, Inactive, etc.  */}
                    <Typography sx={{ color: "text.secondary" }}>
                        {memberRole}
                    </Typography>
                    <Typography
                        sx={{
                            fontWeight: 'bold',
                            color: memberStatus === 'Inactive' ? '#7C8796' : memberStatus ? '#2DD4BF' : 'system'
                        }}
                    >
                        {memberStatus === 'Inactive' ? 'General Member' : memberStatus === 'Active' ? 'Active' : 'no status'}                    </Typography>
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={handleOpen} aria-label="account overview">
                    View Info
                </Button>
                <Modal open={open} onClose={handleClose}>
                    <Box>
                        <AccountOverview
                            memberID={memberID} orgID={orgID} activeRequirement={activeRequirement}
                            requirementType={requirementType} userAttendance={userAttendance}
                            statusObject={statusObject} semesters={semesters} activeSemester={activeSemester}
                        />
                    </Box>
                </Modal>
                {(memberRole === 'Admin' || memberRole === 'Eboard') &&
                    <Button component={Link} to={`/admin/${orgAbbreviation}`} variant="contained">
                        Admin Dashboard
                    </Button>
                }
            </CardActions>
        </Card>
    );
}