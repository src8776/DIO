import * as React from 'react';
import { Container, TableCell, TableRow } from '@mui/material';
import EventRule from './EventRule';


export default function EventItem({
    eventType
}) {

    return (
        <Container>
            {/* // event title  */}
            <TableRow sx={{ borderBottom: "2px solid lightgray" }}>
                <TableCell>{eventType}</TableCell>
                <TableCell/>
                <TableCell/>
            </TableRow>

            {/* // track type  */}
            <TableRow>
                <TableCell/> 
                {/* loop through list of rules per event type */}
                <EventRule/>
            </TableRow>
        </Container>
    );
}