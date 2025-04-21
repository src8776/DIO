import * as React from 'react';
import { Autocomplete, Box, Button, IconButton, Container, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableContainer, TableHead, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { Remove } from '@mui/icons-material';


/**
 * AddAdminPage.jsx
 * 
 * This React component renders a form for selecting and assigning roles to members as either "Admin" or "Eboard."
 * It allows administrators to search for members, add them to a list, assign roles, and submit the data for processing.
 * The component dynamically fetches member data from the backend and provides an interactive interface for role assignment.
 * 
 * Key Features:
 * - Fetches a list of all members in the organization for selection.
 * - Allows administrators to search for and add members to a list.
 * - Provides dropdowns for assigning roles ("Admin" or "Eboard") to selected members.
 * - Displays a table of selected members with options to change roles or remove members.
 * - Handles form submission through a callback function.
 * 
 * Props:
 * - orgID: String or number representing the organization ID.
 * - handleSave: Function to handle the submission of selected members and their roles.
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * 
 * Functions:
 * - addMemberToList: Adds a selected member to the list with a default role of "Eboard."
 * - handleRoleChange: Updates the role of a specific member in the list.
 * - removeMemberFromList: Removes a member from the selected members list.
 * 
 * Hooks:
 * - React.useState: Manages state for all members and selected members.
 * - React.useEffect: Fetches the list of members when the component mounts.
 * 
 * @component
 */
export default function AddAdminPage({ orgID, handleSave }) {
  const [allMembers, setAllMembers] = React.useState([]);
  const [selectedMembers, setSelectedMembers] = React.useState([]);
  const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    width: { xs: '90%', sm: '500px', md: '600px' },
    maxWidth: '100%',
  };

  React.useEffect(() => {
    fetch(`/api/admin/members/names?organizationID=${orgID}`)
      .then((response) => response.json())
      .then((data) => setAllMembers(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const addMemberToList = (member) => {
    if (!selectedMembers.some(m => m.MemberID === member.MemberID)) {
      setSelectedMembers([...selectedMembers, { ...member, role: 'Eboard' }]); // default role
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    setSelectedMembers(prev =>
      prev.map(m => m.MemberID === memberId ? { ...m, role: newRole } : m)
    );
  };


  const removeMemberFromList = (memberId) => {
    setSelectedMembers(selectedMembers.filter(member => member.MemberID !== memberId));
  };

  return (
    <Container >
      <Paper elevation={1} sx={style}>
        <Typography variant="h5">
          New Admin Form
        </Typography>
        {/* Form Elements */}
        <Box component={"form"} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          <FormControl required fullWidth>

            {/* Autocomplete for Member Selection */}
            <Autocomplete
              options={allMembers}
              getOptionLabel={(option) => option.FullName}
              onChange={(event, value) => {
                // Only add to the list if value is not null or undefined
                if (value) {
                  addMemberToList(value);
                }
              }}
              renderInput={(params) => <TextField {...params} label="Add Member" />}
              isOptionEqualToValue={(option, value) => option.MemberID === value.MemberID}
              sx={{ marginBottom: 2 }}
            />
          </FormControl>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Selected Members
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedMembers.map((member) => (
                  <TableRow key={member.MemberID}>
                    <TableCell>{member.FullName}</TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.MemberID, e.target.value)}
                        >
                          <MenuItem value="Admin">Admin</MenuItem>
                          <MenuItem value="Eboard">Eboard</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => removeMemberFromList(member.MemberID)}>
                        <Remove />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Button
          variant='contained'
          onClick={() => handleSave(selectedMembers)}
        >
          Save
        </Button>
      </Paper>
    </Container>
  );
}

