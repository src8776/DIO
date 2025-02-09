import * as React from 'react';
import { Container, TableCell, TableRow } from '@mui/material';
import EventRule from './EventRule';


export default function EventItem({
    clubRule
}) {
    return (
        <Container>
            {/* Event title (e.g., General Meeting) */}
            <TableRow sx={{ borderBottom: "2px solid lightgray" }}>
                <TableCell>{clubRule.eventType}</TableCell>
                <TableCell />
                <TableCell />
            </TableRow>

            {/* Track type and event rules */}
            {ClubRule.eventRules.map((rule, index) => (
                <TableRow key={index}>
                    <TableCell /> 
                    <EventRule {...rule} />
                </TableRow>
            ))}
        </Container>
    );
}