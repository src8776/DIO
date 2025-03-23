import * as React from 'react';
import {
    Box, Select, MenuItem,
    CircularProgress, Typography
} from '@mui/material';
import GenderChart from './GenderChart';

export default function DemographicsTab({ organizationID }) {
    const [semesters, setSemesters] = React.useState([]);
    const [selectedSemester, setSelectedSemester] = React.useState(null);
    const [activeSemester, setActiveSemester] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    // Fetch semesters on component mount
    React.useEffect(() => {
        fetch('/api/admin/getSemesters')
            .then((response) => response.json())
            .then((data) => {
                setSemesters(data);
                const activeSemester = data.find(semester => semester.IsActive === 1);
                if (activeSemester) {
                    setSelectedSemester(activeSemester);
                    setActiveSemester(activeSemester);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching semesters:', error);
                setIsLoading(false);
            });
    }, []);

    // Handle semester selection change
    const handleSemesterChange = (event) => {
        const value = event.target.value;
        if (value === '') {
            setSelectedSemester(null);
        } else {
            const newSemester = semesters.find(sem => sem.SemesterID === value);
            setSelectedSemester(newSemester);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 1 }}>
                <Select
                    value={selectedSemester ? selectedSemester.SemesterID : ''}
                    onChange={handleSemesterChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Select Semester' }}
                    size='small'
                    sx={{ width: 150 }}
                >

                    {semesters.map((sem) => (
                        <MenuItem key={sem.SemesterID} value={sem.SemesterID}>
                            {sem.TermName}
                        </MenuItem>
                    ))}
                </Select>

            </Box>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : selectedSemester && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 4 }}>
                    <GenderChart selectedSemester={selectedSemester} organizationID={organizationID} />
                </Box>
            )}
        </Box>
    );
}