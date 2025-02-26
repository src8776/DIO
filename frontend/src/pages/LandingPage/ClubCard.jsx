import React from "react";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Modal, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import AccountOverview from '../AccountOverview/AccountOverviewPage';
import useAccountStatus from "../../hooks/useAccountStatus";

// TODO: In this component we care about the user's role and status (active/inactive)
// TODO: Good got this needs some cleanup TT.TT

export default function ClubCard({ orgID }) {
    const memberID = 1;
    const { activeRequirement, requirementType, userAttendance, statusObject } = useAccountStatus(orgID, memberID);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const orgType = orgID === 1 ? 'wic' : orgID === 2 ? 'coms' : orgID.toLowerCase(); // "wic" or "coms"
    // store club data up here for maintainability
    // this could also eventually be stored in the database??? 
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
                        {orgID === 2 ? 'COMS' : 'WiC'}
                    </Typography>
                    <Typography variant="h5">
                        {clubInfo.title}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* This will need to come from the user object Admin, Active, Member, Inactive, etc.  */}
                    <Typography sx={{ color: "text.secondary" }}>
                        Admin
                    </Typography>
                    {/* TODO: Make this say active/inactive based on member status */}
                    <Typography

                        sx={{
                            fontWeight: 'bold',
                            color: statusObject.status === 'inactive' ? 'red' : statusObject.status ? 'green' : 'system'
                        }}
                    >
                        {statusObject.status || 'no status'}
                    </Typography>
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
                            statusObject={statusObject}
                        />
                    </Box>
                </Modal>
                {/* IF USER IS ADMIN, SHOW THIS BUTTON, ELSE DO NOOOOOOOOOOOOT SHOW THIS BUTTON !@!!!! */}
                <Button component={Link} to={`/admin/${orgType}`} variant="contained">
                    Admin Dashboard
                </Button>
            </CardActions>
        </Card>
    );
}