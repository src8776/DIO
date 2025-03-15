import * as React from 'react';
import {
    Box, Select, MenuItem,
    CircularProgress, Typography
} from '@mui/material';

export default function SemesterVsSemesterTab({ organizationID }) {
    const [semesters, setSemesters] = React.useState([]);
    const [firstSemester, setFirstSemester] = React.useState(null);
    const [secondSemester, setSecondSemester] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/admin/getSemesters')
            .then((response) => response.json())
            .then((data) => {
                setSemesters(data);
                // Set default selections to the two most recent active semesters if available
                const activeSemesters = data.filter(semester => semester.IsActive === 1);
                if (activeSemesters.length > 0) {
                    const activeIndex = data.findIndex(semester => semester.SemesterID === activeSemesters[0].SemesterID);
                    setSecondSemester(activeSemesters[0]);
                    if (activeIndex > 0) {
                        setFirstSemester(data[activeIndex - 1]);
                    }
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching semesters:', error);
                setIsLoading(false);
            });
    }, []);

    // Handle first semester selection change
    const handleFirstSemesterChange = (event) => {
        const value = event.target.value;
        if (value === '') { // Changed from 0 to ''
            setFirstSemester(null);
        } else {
            const newSemester = semesters.find(sem => sem.SemesterID === value);
            // Prevent selecting the same semester as secondSemester
            if (secondSemester && newSemester.SemesterID === secondSemester.SemesterID) {
                return;
            }
            setFirstSemester(newSemester);
        }
    };

    // Handle second semester selection change
    const handleSecondSemesterChange = (event) => {
        const value = event.target.value;
        if (value === '') { // Changed from 0 to ''
            setSecondSemester(null);
        } else {
            const newSemester = semesters.find(sem => sem.SemesterID === value);
            // Prevent selecting the same semester as firstSemester
            if (firstSemester && newSemester.SemesterID === firstSemester.SemesterID) {
                return;
            }
            setSecondSemester(newSemester);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 2, mb: 2 }}>
                <Select
                    value={firstSemester ? firstSemester.SemesterID : ''} // Changed from 0 to ''
                    onChange={handleFirstSemesterChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Select First Semester' }}
                    size='small'
                    sx={{ width: 150 }}
                >
                    <MenuItem value="">Select First</MenuItem> {/* Added placeholder */}
                    {semesters.map((sem) => (
                        <MenuItem
                            key={sem.SemesterID}
                            value={sem.SemesterID}
                            disabled={secondSemester && sem.SemesterID === secondSemester.SemesterID}
                        >
                            {sem.TermName}
                        </MenuItem>
                    ))}
                </Select>

                <Typography>vs</Typography>

                <Select
                    value={secondSemester ? secondSemester.SemesterID : ''} // Changed from 0 to ''
                    onChange={handleSecondSemesterChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Select Second Semester' }}
                    size='small'
                    sx={{ width: 150 }}
                >
                    <MenuItem value="">Select Second</MenuItem> {/* Added placeholder */}
                    {semesters.map((sem) => (
                        <MenuItem
                            key={sem.SemesterID}
                            value={sem.SemesterID}
                            disabled={firstSemester && sem.SemesterID === firstSemester.SemesterID}
                        >
                            {sem.TermName}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    gap: 4
                }}>
                    {(firstSemester || secondSemester) && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Comparison charts will be added here */}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}