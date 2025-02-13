import * as React from 'react';
import { Container, TableCell, TableRow } from '@mui/material';
import EventRule from './EventRule';


export default function EventItem({
    eventType, eventRules
}) {
    return (
        <>
            {/* Event title (e.g., General Meeting) */}
            <TableRow sx={{ borderBottom: "2px solid lightgray" }}>
                <TableCell>{eventType}</TableCell>
            </TableRow>

            {/* Track type and event rules */}
            {eventRules.map((rule, index) => (
                <TableRow key={`rule-${index}`}>
                    <TableCell/> 
                    <EventRule {...rule} />
                </TableRow>
            ))}
        </>
    );
}