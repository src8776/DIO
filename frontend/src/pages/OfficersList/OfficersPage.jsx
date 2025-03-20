import React, { useState } from "react";
import {
    Box, Container, Table, TableBody,
    TableCell, TableContainer, TableHead,
    TableRow, Paper, Typography
} from "@mui/material";
import { useParams } from 'react-router-dom';
import MemberDetailsDrawer from "../MemberDetails/MemberDetailsDrawer";
import AddAdminModal from './AddAdminModal';


// TODO: pull admin list from database to display here
// TODO: add ability to add/remove admins

const users = [
    { name: "John Doe", email: "john@example.com" },
    { name: "Jane Smith", email: "jane@example.com" },
    { name: "Mark Johnson", email: "mark@example.com" },
    { name: "Emily Davis", email: "emily@example.com" },
];

function OfficersList() {
    const { org } = useParams(); //"wic" or "coms"
    const allowedTypes = ['wic', 'coms'];
    const orgID = org === 'wic' ? 1 : 2;

    if (!allowedTypes.includes(org)) {
        return <Typography component={Paper} variant='h1' sx={{ alignContent: 'center', p: 6, m: 'auto' }}>Organization Doesn't Exist</Typography>;
    }

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
                            {users.map((user, index) => (
                                <TableRow key={index}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><MemberDetailsModal /></TableCell>
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
