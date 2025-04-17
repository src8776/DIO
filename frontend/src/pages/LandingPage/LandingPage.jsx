import React, { useState, useEffect } from "react";
import { Box, Container, Skeleton, Button, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import ClubCard from './ClubCard';
import AddClubCard from "./AddClubCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isProduction = API_BASE_URL.includes("https://dio.gccis.rit.edu");

/**
 * LandingPage.jsx
 * 
 * This React component serves as the landing page for users, displaying a list of clubs the user is affiliated with.
 * It dynamically fetches and displays data such as the user's member ID, organization IDs, and active semester details.
 * The component also handles loading and error states and provides a login button for authentication.
 * 
 * Key Features:
 * - Fetches the user's member ID and affiliated organization IDs from the backend.
 * - Fetches and displays semester data, including the currently active semester.
 * - Dynamically generates `ClubCard` components for each affiliated organization.
 * - Displays a fallback message if the user is not affiliated with any organizations.
 * - Handles loading and error states with appropriate feedback to the user.
 * 
 * Props:
 * - None
 * 
 * Dependencies:
 * - React, Material-UI components, and React Router.
 * - Custom components: ClubCard, AddClubCard.
 * 
 * Functions:
 * - fetchData: Fetches member ID, organization IDs, and semester data from the backend.
 * - handleLogin: Redirects the user to the backend for authentication.
 * 
 * Hooks:
 * - React.useState: Manages state for member ID, organization IDs, semesters, active semester, error, and loading state.
 * - React.useEffect: Triggers data fetching when the component mounts or when the member ID changes.
 * 
 * @component
 */
function LandingPage() {
    const [memberID, setMemberID] = useState(isProduction ? null : 2790);
    const [organizationIDs, setOrganizationIDs] = useState([]);
    const [semesters, setSemesters] = React.useState([]);
    const [activeSemester, setActiveSemester] = React.useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isProduction) {
                    const memberIDResponse = await fetch('/api/user/memberID');
                    const memberIDData = await memberIDResponse.json();
                    setMemberID(memberIDData.memberID);
                }

                if (memberID !== null) {
                    const orgResponse = await fetch(`/api/organizationInfo/organizationIDsByMemberID?memberID=${memberID}`);
                    if (!orgResponse.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const orgText = await orgResponse.text();
                    const orgData = JSON.parse(orgText);
                    setOrganizationIDs(Array.isArray(orgData) ? orgData : []);
                }

                const semestersResponse = await fetch('/api/admin/getSemesters');
                const semestersData = await semestersResponse.json();
                setSemesters(semestersData);
                const activeSemester = semestersData.find(semester => semester.IsActive === 1);
                if (activeSemester) {
                    setActiveSemester(activeSemester);
                }

                setLoading(false);
            } catch (error) {
                setError("Error fetching data.");
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [memberID]);

    const handleLogin = () => {
        window.location.href = '/saml2/login'; // Redirect to backend API for authentication
    };

    if (error) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Box sx={{ color: 'red' }}>{error}</Box> {/* Display error message */}
            </Container>
        );
    }

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Skeleton variant="rectangular" width={210} height={118} />
            </Container>
        );
    }

    return (
        <Container sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            pt: { xs: 2, sm: 4 },
            px: { xs: 1, sm: 2 },
        }}>
            <Typography
                variant="h1"
                sx={{
                    alignSelf: 'flex-start',
                    fontSize: { xs: '2rem', sm: '3rem' },
                }}
            >
                My Clubs
            </Typography>
            {/* Generate ClubCard components for each organizationID */}
            {organizationIDs.length > 0 ? (
                organizationIDs.map(org => (
                    <ClubCard
                        key={org.OrganizationID}
                        memberID={memberID}
                        orgID={org.OrganizationID}
                        semesters={semesters}
                        activeSemester={activeSemester}
                    />
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
                            <Button variant="contained" color="primary" onClick={handleLogin}>
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
