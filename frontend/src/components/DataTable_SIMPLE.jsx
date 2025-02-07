import * as React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export default function SimpleTable() {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    fetch('http://localhost:3001/admin/datatable')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);
        setRows(data);
      })
      .catch((error) => console.error('Error fetching data: ', error));
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>MemberID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>DisplayName</TableCell>
            <TableCell>AttendanceRecord</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.MemberID}>
              <TableCell>{row.MemberID}</TableCell>
              <TableCell>{row.Status}</TableCell>
              <TableCell>{row.DisplayName}</TableCell>
              <TableCell>{row.AttendanceRecord}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
