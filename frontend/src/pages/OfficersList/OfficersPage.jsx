import React, { useState } from "react";
import {
    Box, Container, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, Paper, Typography, IconButton
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from 'react-router-dom';
import AddAdminModal from './AddAdminModal';
import MemberDetailsDrawer from "../MemberDetails/MemberDetailsDrawer";


/**
 * OfficersPage.jsx
 * 
 * This React component renders a page displaying a list of administrators and e-board members for a specific organization.
 * It allows users to view, add, and remove administrators or e-board members. The component dynamically fetches data
 * from the backend and updates the displayed list based on user interactions.
 * 
 * Key Features:
 * - Fetches and displays a list of administrators and e-board members for the selected organization.
 * - Allows users to add new administrators or e-board members using the `AddAdminModal` component.
 * - Provides functionality to remove administrators or e-board members from the list.
 * - Handles loading and error states during data fetching and updates.
 * 
 * Props:
 * - None
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * - React Router for extracting organization parameters.
 * - Custom components: AddAdminModal, MemberDetailsDrawer.
 * 
 * Functions:
 * - handleDelete: Sends a request to the backend to remove a member from the admin or e-board list.
 * 
 * Hooks:
 * - React.useState: Manages state for organization ID, admin data, and UI interactions.
 * - React.useEffect: Fetches organization ID and admin data when dependencies change.
 * 
 * @component
 */
function OfficersList() {
    const { org } = useParams(); //"wic" or "coms"
    const allowedTypes = ['wic', 'coms'];
    const [orgID, setOrgID] = React.useState(null);
    const [adminData, setAdminData] = React.useState([]);

    if (!allowedTypes.includes(org)) {
        return (
            <Typography component={Paper} variant='h1' sx={{ alignContent: 'center', p: 6, m: 'auto' }}>
                Organization Doesn't Exist
            </Typography>
        );
    }

    // Grab oranization ID from the abbreviation value
    React.useEffect(() => {
        fetch(`/api/organizationInfo/organizationIDByAbbreviation?abbreviation=${org}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    setOrgID(data[0].OrganizationID);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [org]);

    React.useEffect(() => {
        if (orgID !== null) {
            fetch(`/api/admin/getOfficersAndAdmin?organizationID=${orgID}`)
                .then((response) => response.json())
                .then((data) => {
                    setAdminData(data);
                })
                .catch((error) => {
                    console.error('Error fetching member data:', error);
                });
        }
    }, [orgID]);

    const handleDelete = (memberID) => {
        fetch(`/api/admin/setMember?organizationID=${orgID}&memberID=${memberID}`, {
            method: 'POST'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete officer');
                }
                return response.json();
            })
            .then((data) => {
                setAdminData(adminData.filter(officer => officer.MemberID !== memberID));
            })
            .catch((error) => {
                console.error('Error deleting officer:', error);
            });
    };

    return (

        <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5">
                    Admin User List
                </Typography>
                <Box>
                    <AddAdminModal orgID={orgID} />
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Role</strong></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {adminData.map((user, index) => (
                                <TableRow key={index}>
                                    <TableCell>{user.FullName}</TableCell>
                                    <TableCell>{user.Email}</TableCell>
                                    <TableCell>{user.RoleName}</TableCell>
                                    <TableCell align="center">
                                        {adminData.length > 1 && (
                                            <IconButton
                                                onClick={() => handleDelete(user.MemberID)}
                                                sx={{
                                                    textTransform: 'none',
                                                    color: 'red',
                                                    borderColor: 'red',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                                        borderColor: 'red',
                                                    }
                                                }}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
}

export default OfficersList;
