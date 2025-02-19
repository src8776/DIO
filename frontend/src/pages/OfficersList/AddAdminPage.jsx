import * as React from 'react';
import { Autocomplete, Box, Button, IconButton, Container, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableContainer, TableHead, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { Remove } from '@mui/icons-material';

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

// TODO: Update Permissions of selected member

export default function AddAdminPage({ orgID, handleSave }) {
  const [allMembers, setAllMembers] = React.useState([]);
  const [selectedMembers, setSelectedMembers] = React.useState([]);

  React.useEffect(() => {
    fetch(`/api/admin/members/names?organizationID=${orgID}`)
      .then((response) => response.json())
      .then((data) => setAllMembers(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const addMemberToList = (member) => {
    if (!selectedMembers.some(m => m.MemberID === member.MemberID)) {
      setSelectedMembers([...selectedMembers, { ...member }]);
    }
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
                  <TableCell align="center">Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedMembers.map((member) => (
                  <TableRow key={member.MemberID}>
                    <TableCell>{member.FullName}</TableCell>
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
          onClick={handleSave}
        >
          Save
        </Button>
      </Paper>
    </Container>
  );
}

