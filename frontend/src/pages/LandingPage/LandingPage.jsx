import React, { useState, useEffect } from "react";
import { Box, Container, Skeleton } from "@mui/material";
import ClubCard from './ClubCard';
import AddClubCard from "./AddClubCard";

// TODO: Role based access control
// TODO: fetch user's club affiliations (WiC? COMS? Both?)

function LandingPage() {
    const [memberID, setMemberID] = useState(null);
    const [organizationIDs, setOrganizationIDs] = useState([]);
    const [error, setError] = useState(null); 

    useEffect(() => {
        fetch('/api/user/memberID')
            .then(response => response.json())
            .then(data => setMemberID(data.memberID))
            .catch(error => {
                setError("Error fetching member ID.");
                console.error('Error fetching memberID:', error);
            });
    }, []);


    useEffect(() => {
        if (memberID !== null) {
            fetch(`/api/organizationInfo/organizationIDsByMemberID?memberID=${memberID}`)
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setOrganizationIDs(data);
                    } else {
                        setOrganizationIDs([]);
                    }
                })
                .catch(error => {
                    setError("Error fetching organizations.");
                    console.error('Error fetching data for MemberName:', error);
                });
        }
    }, [memberID]);

    if (error) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Box sx={{ color: 'red' }}>{error}</Box> {/* Display error message */}
            </Container>
        );
    }

    return (
        <Container sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap', alignItems: 'center', gap: 4, pt: 4 }}>
            {/* Generate ClubCard components for each organizationID */}
            {organizationIDs.length > 0 ? (
                organizationIDs.map(org => (
                    <ClubCard key={org.OrganizationID} memberID={memberID} orgID={org.OrganizationID} />
                ))
            ) : (
                <Box>No organizations found.</Box> // Display message if no organizations found
            )}
            {/* Setting up for expandability */}
            {/* <AddClubCard/> */}
        </Container>
    );
}

export default LandingPage;
