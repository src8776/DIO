import React from "react";
import { useTheme, TableRow, TableCell, Checkbox } from '@mui/material';
import MemberDetailsDrawer from '../MemberDetails/MemberDetailsDrawer';


/**
 * DataTableRow.jsx
 * 
 * This React component represents a single row in the DataTable component.
 * It displays member information such as name, status, attendance record, and last updated date.
 * The row is interactive, allowing selection and providing access to detailed member information
 * through the MemberDetailsDrawer component.
 * 
 * Key Features:
 * - Displays member details including name, status, attendance record, and last updated date.
 * - Highlights the row when selected and allows toggling selection.
 * - Dynamically styles the status text based on the member's current status.
 * - Provides a drawer for viewing and editing detailed member information.
 * 
 * Props:
 * - row: Object containing the member's data (e.g., FullName, Status, AttendanceRecord, LastUpdated).
 * - isItemSelected: Boolean indicating whether the row is selected.
 * - labelId: String used for accessibility labeling.
 * - handleClick: Function to handle row selection.
 * - orgID: String representing the organization ID.
 * - selectedSemester: Object representing the currently selected semester.
 * - activeSemester: Object representing the active semester.
 * - onMemberUpdate: Callback function triggered when member data is updated.
 * 
 * Dependencies:
 * - React, Material-UI components.
 * - MemberDetailsDrawer: A component for viewing and editing detailed member information.
 * 
 * Functions:
 * - statusColor: Determines the color of the status text based on the member's current status.
 * - formattedDate: Formats the "LastUpdated" date into a readable string.
 * 
 * @component
 */

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