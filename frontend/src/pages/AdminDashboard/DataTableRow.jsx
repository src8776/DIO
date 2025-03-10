import React from "react";
import { TableRow, TableCell, Checkbox } from '@mui/material';
import MemberDetailsModal from '../MemberDetails/MemberDetailsModal';


const cellStyles = {
    pl: '16px',
    pt: '0px',
    pb: '0px'
};

const DataTableRow = ({ row, isItemSelected, labelId, handleClick, orgID, selectedSemester }) => {
    const [memberStatus, setMemberStatus] = React.useState('');

    const statusColor = memberStatus === 'Inactive' ? 'red' : 'green';

    const formattedDate = row.LastUpdated
        ? new Date(row.LastUpdated).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) : 'N/A';

    React.useEffect(() => {
        if (!row.MemberID) return;
        fetch(`/api/memberDetails/status?memberID=${row.MemberID}&organizationID=${orgID}&semesterID=${selectedSemester.SemesterID}`)
            .then(response => response.json())
            .then(data => setMemberStatus(data.status))
            .catch(error => console.error('Error fetching data for MemberName:', error));
    }, [row.MemberID]);

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
            <TableCell align="left" sx={{ cellStyles }}>
                {row.FullName}
            </TableCell>
            <TableCell
                align="left"
                id={labelId}
                sx={{ ...cellStyles, color: statusColor }}>
                {memberStatus}
            </TableCell>
            <TableCell align="left" sx={{ cellStyles }}>
                {row.AttendanceRecord} meetings
            </TableCell>
            <TableCell sx={{ cellStyles }}>
                {formattedDate}
            </TableCell>
            <TableCell sx={{ pl: '16px', pt: '0px', pb: '0px' }}>
                <MemberDetailsModal memberID={row.MemberID} orgID={orgID} memberStatus={memberStatus} selectedSemester={selectedSemester} />
            </TableCell>
        </TableRow>
    );
};

export default DataTableRow;