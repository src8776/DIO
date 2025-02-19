import React from 'react';
import { TableRow, TableCell, Checkbox } from '@mui/material';
import MemberDetailsModal from './MemberDetailsModal';

const DataTableRow = ({ row, isItemSelected, labelId, handleClick, orgID }) => {
    return (
        <TableRow
            hover
            onClick={(event) => handleClick(event, row.MemberID)}
            role="checkbox"
            aria-checked={isItemSelected}
            tabIndex={-1}
            key={row.MemberID}
            selected={isItemSelected}
            sx={{ cursor: 'pointer' }}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
                    checked={isItemSelected}
                    inputProps={{
                        'aria-labelledby': labelId,
                    }}
                />
            </TableCell>
            <TableCell align="left" sx={{ pl: '16px', pt: '0px', pb: '0px' }}>{row.FullName}</TableCell>
            <TableCell
                component="th"
                id={labelId}
                scope="row"
                sx={{
                    pl: '16px', pt: '0px', pb: '0px',
                    color: row.Status === 'Inactive' ? 'red' : 'green',
                }}
            >
                {row.Status}
            </TableCell>
            <TableCell align="left" sx={{ pl: '16px', pt: '0px', pb: '0px' }}>{row.AttendanceRecord} meetings</TableCell>
            <TableCell sx={{ pl: '16px', pt: '0px', pb: '0px' }}>
                {row.LastUpdated ? new Date(row.LastUpdated).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }) : 'N/A'}
            </TableCell>
            <TableCell sx={{ pl: '16px', pt: '0px', pb: '0px' }}>
                <MemberDetailsModal memberID={row.MemberID} orgID={orgID} />
            </TableCell>
        </TableRow>
    );
};

export default DataTableRow;