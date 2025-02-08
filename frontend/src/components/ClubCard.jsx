import React from "react";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Modal, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import AccountOverview from '../pages/AccountOverview/AccountOverviewPage';

// TODO: In this component we care about the user's role and status (active/inactive)

export default function ClubCard({ userObj, clubAbbr }) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // store club data up here for maintainability
    // this could also eventually be stored in the database??? 
    const comsInfo = {
        image: "/COMS.png",
        imageFit: "contain",
        title: "Computing Organization for Multicultural Students",
    };

    const wicInfo = {
        image: "/Gritty_resized.jpg",
        imageFit: "",
        title: "Women in Computing",
    };

    const clubInfo = clubAbbr === "COMS" ? comsInfo : wicInfo;

    return (
        <Card sx={{ width: 350, display: "flex", flexDirection: "column", height: 340 }}>
            <CardMedia
                component="img"
                sx={{
                    width: "100%",
                    height: 140,
                    objectFit: clubInfo.imageFit,
                }}
                image={clubInfo.image}
                title={clubAbbr}
            />
            <CardContent sx={{ borderTop: "1px solid #f0f0f0", flexGrow: 1 }}>
                <Typography gutterBottom sx={{ color: "text.secondary", fontSize: 14 }}>
                    {clubAbbr}
                </Typography>
                <Typography variant="h5">
                    {clubInfo.title}
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    {/* This will need to come from the user object Admin, Active, Member, Inactive, etc.  */}
                    <Typography sx={{ color: "text.secondary" }}>
                        Admin
                    </Typography>
                    {/* TODO: Make this say active/inactive based on member status */}
                    <Typography sx={{ fontWeight: 'bold', color: "green", ml: .5 }}>
                        - Active
                    </Typography>
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={handleOpen} aria-label="account overview">
                    View Info
                </Button>
                <Modal open={open} onClose={handleClose}>
                    <Box >
                        <AccountOverview userObj={userObj} />
                    </Box>
                </Modal>
                {/* IF USER IS ADMIN, SHOW THIS BUTTON, ELSE DO NOOOOOOOOOOOOT SHOW THIS BUTTON !@!!!! */}
                <Button component={Link} to="/admin" variant="contained">
                    Admin Dashboard
                </Button>
            </CardActions>
        </Card>
    );
}