import { Container, Paper, Typography } from '@mui/material'
import React from 'react'
import DataTable from '../../components/DataTable'


function AdminDash() {
    return (
        <Container>
          <Paper elevation={1}>
            <Typography
                variant="h2"
                sx={{ my: 4, textAlign: "center", color: "primary.main"}}
            >
                Insert Org Name Here: Admin Dashboard
            </Typography>

            <Paper elevation={2}>
              <DataTable/>
            </Paper>

          </Paper>
        </Container>
    );
    
}

export default AdminDash;

