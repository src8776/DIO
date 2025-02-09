import * as React from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
  } from '@mui/material';

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

export default function RuleModal({ name, rules }) {
    // Helper function that renders extra details from a rule.
    // It will output any property other than id, description, or points.
    const renderExtraDetails = (rule) => {
      const extraKeys = Object.keys(rule).filter(
        (key) => !["id", "description", "points"].includes(key)
      );
  
      if (extraKeys.length === 0) {
        return null;
      }
  
      return (
        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
          {extraKeys.map((key) => (
            <li key={key}>
              <strong>{key}:</strong> {rule[key]}
            </li>
          ))}
        </ul>
      );
    };
  
    return (
      <Container>
        <Paper elevation={1} sx={style}>
          <Typography variant="h5" gutterBottom>
            {name}
          </Typography>
          <Paper component="form" sx={{ width: '100%', overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Rule Description</strong></TableCell>
                  {rules.some(rule => rule.points) ? <TableCell><strong>Points</strong></TableCell> : <></> }
                  
                  <TableCell><strong>Details</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules && rules.length > 0 ? (
                  rules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell>{rule.description}</TableCell>
                      {rules.some(rule => rule.points) ? <TableCell>{rule.points}</TableCell> : <></>}
                      <TableCell>{renderExtraDetails(rule)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No rules available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Paper>
      </Container>
    );
  }