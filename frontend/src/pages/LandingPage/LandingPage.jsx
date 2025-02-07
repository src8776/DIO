import React, { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import ClubCard from '../../components/ClubCard';

// TODO: Role based access control
// TODO: active/inactive status should dynamically update based on user status
// TODO: fetch user's club affiliations (WiC? COMS? Both?)

function LandingPage() {

    // this will be the object containing the user's information
    const [userObj, setUserObj] = useState();

    return (
        <Container sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" >
                DIO Organizations
            </Typography>

            {/* Module Container */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>

                {/* TODO: Only show the card that the user is a member of */}

                {/* COMS Card */}
                <ClubCard clubAbbr={'COMS'}/>

                {/* WiC Card */}
                <ClubCard clubAbbr={'WiC'}/>
            </Box>
        </Container>
    );
}

export default LandingPage;
