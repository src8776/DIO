import React, { useState } from "react";
import { Box, Container, Table, TableBody, 
    TableCell, TableContainer, TableHead, 
    TableRow, Paper, Typography } from "@mui/material";
import { Link, useParams } from 'react-router-dom';
import MemberDetailsModal from '../../components/MemberDetailsModal';


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
    const orgID = org === 'wic' ? 1 : 2;

    return (

        <Container sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Admin User List
                </Typography>

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
            </Paper>
        </Container>
    );
}

export default OfficersList;
