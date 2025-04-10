import React from "react";
import { useTheme, TableRow, TableCell, Checkbox } from '@mui/material';
import MemberDetailsDrawer from '../MemberDetails/MemberDetailsDrawer';


const cellStyles = { pl: '16px', pt: '0px', pb: '0px' };

const DataTableRow = ({ row, isItemSelected, labelId, handleClick, orgID, selectedSemester, activeSemester, onMemberUpdate }) => {
    const theme = useTheme();
    const memberStatus = row.Status || 'General';
    const displayStatus = memberStatus === 'CarryoverActive' ? 'Active*' : memberStatus;

    const statusColor = (() => {
        switch (memberStatus) {
            case 'Active':
                return  `${theme.palette.activeStatus.default}`;
            case 'CarryoverActive':
                return `${theme.palette.activeStatus.default}`;
            case 'Exempt':
                return `${theme.palette.exemptStatus.default}`;
            case 'General':
                return `${theme.palette.generalStatus.default}`;
            case 'Alumni':
                return 'rgb(133, 113, 1)';
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
            {/* <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
                    checked={isItemSelected}
                    inputProps={{ 'aria-labelledby': labelId }}
                />
            </TableCell> */}
            <TableCell align="left" sx={{ ...cellStyles }}>
                {row.FullName}
            </TableCell>
            <TableCell
                align="left"
                id={labelId}
                sx={{ ...cellStyles, color: statusColor }}
            >
                {displayStatus}
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