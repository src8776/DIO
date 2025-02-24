import React, { useState, useEffect } from "react";
import { Box, Container, Skeleton } from "@mui/material";
import ClubCard from './ClubCard';

// TODO: Role based access control
// TODO: fetch user's club affiliations (WiC? COMS? Both?)

function LandingPage() {
    const [memberID, setMemberID] = useState(16);
    const [organizationIDs, setOrganizationIDs] = useState([]);

    React.useEffect(() => {
        fetch(`/api/OrganizationInfo/allOrganizationIDs`)
            .then(response => response.json())
            .then(data => setOrganizationIDs(data))
            .catch(error => console.error('Error fetching data for MemberName:', error));
    }, []);
        

    return (
        <Container sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Module Container */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Generate ClubCard components for each organizationID */}
                {organizationIDs.map(org => (
                    <ClubCard key={org.OrganizationID} memberID={memberID} orgID={org.OrganizationID} />
                ))}
            </Box>
        </Container>
    );
}

export default LandingPage;
