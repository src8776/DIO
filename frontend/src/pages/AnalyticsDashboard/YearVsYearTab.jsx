import * as React from 'react';
import {
    Box, Select, MenuItem,
    CircularProgress, Typography
} from '@mui/material';

export default function YearVsYearTab({ organizationID }) {
    const [semesters, setSemesters] = React.useState([]);
    const [years, setYears] = React.useState([]);
    const [firstYear, setFirstYear] = React.useState(null);
    const [secondYear, setSecondYear] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    // Fetch semesters and process years on component mount
    React.useEffect(() => {
        fetch('/api/admin/getSemesters')
            .then((response) => response.json())
            .then((data) => {
                setSemesters(data);
                
                // Extract unique academic years from semesters
                const uniqueYears = [...new Set(data.map(sem => sem.AcademicYear))].sort();
                setYears(uniqueYears);

                // Set default selections to the two most recent years if available
                if (uniqueYears.length >= 2) {
                    setFirstYear(uniqueYears[uniqueYears.length - 1]);
                    setSecondYear(uniqueYears[uniqueYears.length - 2]);
                } else if (uniqueYears.length === 1) {
                    setFirstYear(uniqueYears[0]);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching semesters:', error);
                setIsLoading(false);
            });
    }, []);

    // Handle first year selection change
    const handleFirstYearChange = (event) => {
        const value = event.target.value;
        if (value === 0) {
            setFirstYear(null);
        } else {
            // Prevent selecting the same year as secondYear
            if (secondYear && value === secondYear) {
                return;
            }
            setFirstYear(value);
        }
    };

    // Handle second year selection change
    const handleSecondYearChange = (event) => {
        const value = event.target.value;
        if (value === 0) {
            setSecondYear(null);
        } else {
            // Prevent selecting the same year as firstYear
            if (firstYear && value === firstYear) {
                return;
            }
            setSecondYear(value);
        }
    };

    // Get semesters for a specific year
    const getYearSemesters = (year) => {
        return semesters.filter(sem => sem.AcademicYear === year);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 2, mb: 2 }}>
                <Select
                    value={firstYear || 0}
                    onChange={handleFirstYearChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Select First Year' }}
                    size='small'
                    sx={{ width: 150 }}
                >
                    {/* <MenuItem value={0}>Select First</MenuItem> */}
                    {years.map((year) => (
                        <MenuItem 
                            key={year} 
                            value={year}
                            disabled={secondYear && year === secondYear}
                        >
                            {year}
                        </MenuItem>
                    ))}
                </Select>

                <Typography>vs</Typography>

                <Select
                    value={secondYear || 0}
                    onChange={handleSecondYearChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Select Second Year' }}
                    size='small'
                    sx={{ width: 150 }}
                >
                    {/* <MenuItem value={0}>Select Second</MenuItem> */}
                    {years.map((year) => (
                        <MenuItem 
                            key={year} 
                            value={year}
                            disabled={firstYear && year === firstYear}
                        >
                            {year}
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
                    {(firstYear || secondYear) && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Comparison charts will be added here */}
                            {/* You can use getYearSemesters(firstYear) and getYearSemesters(secondYear) */}
                            {/* to get the semester data for each selected year */}
                            <Typography>This is where year vs year graphs would go... IF I HAD ANY</Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}