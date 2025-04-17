import * as React from 'react';
import {
    Box, Select, MenuItem,
    CircularProgress, Typography
} from '@mui/material';
import EventTypeComparisonChart from './EventTypeComparisonChart';
import CommitmentComparisonChart from './CommitmentComparisonChart';
import ActiveMemberComparison from './ActiveMemberComparison';

/**
 * SemesterVsSemesterTab.jsx
 * 
 * This React component renders the "Semester vs Semester" tab in the analytics dashboard.
 * It allows users to compare data between two selected semesters, including event type attendance,
 * member commitment, and active member counts. The component dynamically fetches semester data
 * and updates the displayed charts based on the selected semesters.
 * 
 * Key Features:
 * - Fetches and displays a list of semesters for selection.
 * - Automatically selects the two most recent active semesters on initial load.
 * - Provides dropdown menus for selecting two semesters to compare.
 * - Displays multiple comparison charts for the selected semesters.
 * - Handles loading states and displays a spinner while fetching data.
 * - Provides fallback messages when semesters are not selected.
 * 
 * Props:
 * - organizationID: String representing the organization ID.
 * 
 * Dependencies:
 * - React, Material-UI components.
 * - Custom components: EventTypeComparisonChart, CommitmentComparisonChart, ActiveMemberComparison.
 * 
 * Functions:
 * - React.useEffect: Fetches semester data on component mount.
 * - handleFirstSemesterChange: Updates the first selected semester based on user input.
 * - handleSecondSemesterChange: Updates the second selected semester based on user input.
 * 
 * Hooks:
 * - React.useState: Manages state for semesters, selected semesters, and loading state.
 * - React.useEffect: Triggers data fetching when the component mounts.
 * 
 * @component
 */
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
        const newSemester = semesters.find(sem => sem.SemesterID === value);
        if (newSemester && (!secondSemester || newSemester.SemesterID !== secondSemester.SemesterID)) {
            setFirstSemester(newSemester);
        }
    };

    // Handle second semester selection change
    const handleSecondSemesterChange = (event) => {
        const value = event.target.value;
        const newSemester = semesters.find(sem => sem.SemesterID === value);
        if (newSemester && (!firstSemester || newSemester.SemesterID !== firstSemester.SemesterID)) {
            setSecondSemester(newSemester);
        }
    };

    return (
        <Box>
            {/* Semester Selectors */}
            <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 2, mb: 2 }}>
                <Select
                    value={firstSemester ? firstSemester.SemesterID : ''}
                    onChange={handleFirstSemesterChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Select First Semester' }}
                    size='small'
                    sx={{ width: 150 }}
                >

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
                    value={secondSemester ? secondSemester.SemesterID : ''}
                    onChange={handleSecondSemesterChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Select Second Semester' }}
                    size='small'
                    sx={{ width: 150 }}
                >

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
            ) : semesters && firstSemester && secondSemester ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 4 }}>
                    <EventTypeComparisonChart
                        organizationID={organizationID}
                        firstSemester={firstSemester}
                        secondSemester={secondSemester}
                    />
                    <CommitmentComparisonChart
                        organizationID={organizationID}
                        firstSemester={firstSemester}
                        secondSemester={secondSemester}
                    />
                    <ActiveMemberComparison organizationID={organizationID} firstSemester={firstSemester} secondSemester={secondSemester} />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                        Please select both semesters to compare
                    </Typography>
                </Box>
            )}
        </Box>
    );
}