import React, { useState, useEffect } from "react";
import { Box, Container, Skeleton } from "@mui/material";
import ClubCard from './ClubCard';
import AddClubCard from "./AddClubCard";

// TODO: Role based access control
// TODO: fetch user's club affiliations (WiC? COMS? Both?)
const fetchUserProfileData = async () => {
    try {
      const response = await fetch('/api/user/memberID');
      if (!response.ok) throw new Error('Failed to fetch user profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

function LandingPage() {
    const [memberID, setMemberID] = useState(null);
    const [organizationIDs, setOrganizationIDs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const profileData = await fetchUserProfileData();
            if (profileData && profileData.memberID) {
                setMemberID(profileData.memberID);
            } else {
                console.error('No member ID found');
            }
        };
        fetchData();
    }, []);

    React.useEffect(() => {
        fetch(`/api/organizationInfo/organizationIDsByMemberID?memberID=${memberID}`)
            .then(response => response.json())
            .then(data => setOrganizationIDs(data))
            .catch(error => console.error('Error fetching data for MemberName:', error));
    }, [memberID]);


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
