import React, { useState, useEffect } from "react";
import { Box, Container, Skeleton, Button, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import ClubCard from './ClubCard';
import AddClubCard from "./AddClubCard";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isProduction = API_BASE_URL.includes("https://dio.gccis.rit.edu");

function LandingPage() {
    const [memberID, setMemberID] = useState(isProduction ? null : 89);
    const [organizationIDs, setOrganizationIDs] = useState([]);
    const [error, setError] = useState(null);

    if (isProduction) {
        useEffect(() => {
            fetch('/api/user/memberID')
                .then(response => response.json())
                .then(data => setMemberID(data.memberID))
                .catch(error => {
                    setError("Error fetching member ID.");
                    console.error('Error fetching memberID:', error);
                });
        }, []);
    }

    useEffect(() => {
        if (memberID !== null) {
            fetch(`/api/organizationInfo/organizationIDsByMemberID?memberID=${memberID}`)
                .then(response => {
                    if (!response.ok) {
                        console.error('Network response was not ok:', response.status, response.statusText);
                        throw new Error('Network response was not ok');
                    }
                    return response.text(); // Get the response as text
                })
                .then(text => {
                    try {
                        const data = JSON.parse(text); // Try to parse the text as JSON
                        if (Array.isArray(data)) {
                            setOrganizationIDs(data);
                        } else {
                            setOrganizationIDs([]);
                        }
                    } catch (error) {
                        console.error('Failed to parse JSON:', error);
                        throw new Error('Failed to parse JSON');
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
                <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            You are not affiliated with any organizations yet.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            Please contact support or check your credentials.
                        </Typography>
                        <Box sx={{ mt: 4 }}>
                            <Button variant="contained" color="primary" component={Link} to="/login">
                                Login
                            </Button>
                        </Box>
                    </Box>
                </Container>
            )}
            {/* Setting up for expandability */}
            {/* <AddClubCard/> */}
        </Container>
    );
}

export default LandingPage;
