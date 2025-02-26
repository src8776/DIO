import React, { useState, useEffect } from "react";
import { Box, Container, Skeleton } from "@mui/material";
import ClubCard from './ClubCard';
import AddClubCard from "./AddClubCard";

// TODO: Role based access control
// TODO: fetch user's club affiliations (WiC? COMS? Both?)

function LandingPage() {
    const [memberID, setMemberID] = useState(null);
    const [organizationIDs, setOrganizationIDs] = useState([]);

    React.useEffect(() => {
        fetch(`/api/OrganizationInfo/allOrganizationIDs`)
            .then(response => response.json())
            .then(data => setOrganizationIDs(data))
            .catch(error => console.error('Error fetching data for MemberName:', error));
    }, []);


    return (
        <Container sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap', alignItems: 'center', gap: 4, pt: 4 }}>
            {/* Generate ClubCard components for each organizationID */}
            {organizationIDs.map(org => (
                <ClubCard key={org.OrganizationID} memberID={memberID} orgID={org.OrganizationID} />
            ))}
            {/* Setting up for expandability */}
            {/* <AddClubCard/> */}
        </Container>
    );
}

export default LandingPage;
