import * as React from 'react';
import {
    Box, Select, MenuItem,
    CircularProgress, Typography
} from '@mui/material';
import GenderChart from './GenderChart';

/**
 * DemographicsTab.jsx
 * 
 * This React component renders the demographics tab in the analytics dashboard.
 * It allows users to view demographic data, such as gender distribution, for a selected semester.
 * The component fetches semester data from the backend and dynamically updates the displayed charts
 * based on the selected semester.
 * 
 * Key Features:
 * - Fetches and displays a list of semesters for selection.
 * - Automatically selects the active semester on initial load.
 * - Displays a gender distribution chart for the selected semester.
 * - Handles loading states and displays a spinner while fetching data.
 * - Provides a dropdown menu for selecting different semesters.
 * 
 * Props:
 * - organizationID: String representing the organization ID.
 * 
 * Dependencies:
 * - React, Material-UI components.
 * - GenderChart: A custom component for rendering gender distribution charts.
 * 
 * Functions:
 * - React.useEffect: Fetches semester data on component mount.
 * - handleSemesterChange: Updates the selected semester based on user input.
 * 
 * Hooks:
 * - React.useState: Manages state for semesters, selected semester, active semester, and loading state.
 * - React.useEffect: Triggers data fetching when the component mounts.
 * 
 * @component
 */
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