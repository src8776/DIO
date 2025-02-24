import * as React from 'react';
import { TableRow, TableCell } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

function SkeletonTableRow({ index }) {

    const cellStyles = {
        pl: '16px',
        pt: '0px',
        pb: '0px'
    };

    return (
        <TableRow key={`skeleton-${index}`} >
            <TableCell padding="checkbox" sx={{pl: '16px'}}>
                <Skeleton variant="rectangular" width={24} />
            </TableCell>
            <TableCell sx={{ cellStyles }}>
                <Skeleton variant="text" width="80%" />
            </TableCell>
            <TableCell sx={{ cellStyles }}>
                <Skeleton variant="text" width="60%" />
            </TableCell>
            <TableCell sx={{ cellStyles }}>
                <Skeleton variant="text" width="40%" />
            </TableCell>
            <TableCell sx={{ cellStyles }}>
                <Skeleton variant="text" width="70%" />
            </TableCell>
            <TableCell sx={{ cellStyles }}>
                <Skeleton variant="circular" width={20} height={20}/>
            </TableCell>
        </TableRow>
    );
}

export default SkeletonTableRow;