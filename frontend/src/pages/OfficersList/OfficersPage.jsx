import React, { useState } from "react";
import {
    Box, Container, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, Paper, Typography
} from "@mui/material";
import { useParams } from 'react-router-dom';
import MemberDetailsDrawer from "../MemberDetails/MemberDetailsDrawer";
import AddAdminModal from './AddAdminModal';

// TODO: add ability to add/remove admins

function OfficersList() {
    const { org } = useParams(); //"wic" or "coms"
    const allowedTypes = ['wic', 'coms'];
    const orgID = org === 'wic' ? 1 : 2;
    const [adminData, setAdminData] = React.useState([]);

    if (!allowedTypes.includes(org)) {
        return <Typography component={Paper} variant='h1' sx={{ alignContent: 'center', p: 6, m: 'auto' }}>Organization Doesn't Exist</Typography>;
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
        fetch(`/api/admin/getOfficersAndAdmin?organizationID=${orgID}`)
            .then((response) => response.json())
            .then((data) => {
                setMemberData(data);
                setIsLoading(false);
        })
        .catch((error) => {
            console.error('Error fetching member data:', error);
        });
    }, [org]);

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
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {adminData.map((user, index) => (
                                <TableRow key={index}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><MemberDetailsDrawer /></TableCell>
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
