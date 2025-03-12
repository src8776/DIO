import React from "react";
import { TableRow, TableCell, Checkbox } from '@mui/material';
import MemberDetailsModal from '../MemberDetails/MemberDetailsModal';


const cellStyles = {
    pl: '16px',
    pt: '0px',
    pb: '0px'
};

const DataTableRow = ({ row, isItemSelected, labelId, handleClick, orgID, selectedSemester, activeSemester }) => {
    const [memberStatus, setMemberStatus] = React.useState('');

    const statusColor = (memberStatus === 'Inactive' || memberStatus === 'N/A') ? 'red' : 'green';

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
            if (selectedSemester === null) {
                setMemberStatus('N/A');
                return;
            }
            const semesterID = selectedSemester.SemesterID;
            fetch(`/api/memberDetails/status?memberID=${row.MemberID}&organizationID=${orgID}&semesterID=${semesterID}`)
                .then(response => response.json())
                .then(data => setMemberStatus(data.status))
                .catch(error => console.error('Error fetching data for MemberName:', error));
        }, [row.MemberID, selectedSemester]);

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
                <MemberDetailsModal
                    memberID={row.MemberID}
                    orgID={orgID}
                    memberStatus={memberStatus}
                    selectedSemester={selectedSemester}
                    activeSemester={activeSemester}
                />
            </TableCell>
        </TableRow>
    );
};

export default DataTableRow;