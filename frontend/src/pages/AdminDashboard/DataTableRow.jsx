import React from "react";
import { TableRow, TableCell, Checkbox } from '@mui/material';
import MemberDetailsDrawer from '../MemberDetails/MemberDetailsDrawer';


const cellStyles = { pl: '16px', pt: '0px', pb: '0px' };

const DataTableRow = ({ row, isItemSelected, labelId, handleClick, orgID, selectedSemester, activeSemester, onMemberUpdate }) => {
    const memberStatus = row.Status || 'N/A';

    const statusColor = (() => {
        switch (memberStatus) {
            case 'Active':
                return '#2DD4BF';
            case 'Exempt':
                return '#be9bc4';
            case 'General':
                return '#7C8796';
            case 'Inactive':
                return '#5C6773'; // slightly darker gray than General
            default:
                return '#B0B0B0';
        }
    })();

    const formattedDate = row.LastUpdated
        ? new Date(row.LastUpdated).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) : 'N/A';

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
                    inputProps={{ 'aria-labelledby': labelId }}
                />
            </TableCell>
            <TableCell align="left" sx={{ ...cellStyles }}>
                {row.FullName}
            </TableCell>
            <TableCell
                align="left"
                id={labelId}
                sx={{ ...cellStyles, color: statusColor }}
            >
                {memberStatus}
            </TableCell>
            <TableCell align="left" sx={{ ...cellStyles }}>
                {row.AttendanceRecord} meetings
            </TableCell>
            <TableCell sx={{ ...cellStyles }}>
                {formattedDate}
            </TableCell>
            <TableCell sx={{ pl: '16px', pt: '0px', pb: '0px' }}>
                <MemberDetailsDrawer
                    memberID={row.MemberID}
                    orgID={orgID}
                    memberStatus={memberStatus}
                    selectedSemester={selectedSemester}
                    activeSemester={activeSemester}
                    onMemberUpdate={onMemberUpdate}
                />
            </TableCell>
        </TableRow>
    );
};

export default DataTableRow;