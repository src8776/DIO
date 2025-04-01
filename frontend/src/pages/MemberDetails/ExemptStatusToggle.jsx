import * as React from 'react';
import {
    Typography, Paper, Box, Button, Select, MenuItem,
    InputLabel, FormControl, Switch
} from "@mui/material";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);


export default function ExemptStatusToggle({
    exemptEnabled,
    setExemptEnabled,
    exemptStartSemester,
    setExemptStartSemester,
    exemptDuration,
    setExemptDuration,
    exemptSemesters,
    memberStatus,
    semesters,
    activeSemester,
    onExemptSubmit,
    onExemptUndo
}) {
    const handleExemptToggle = (e) => setExemptEnabled(e.target.checked);
    const hasExemptSemesters = exemptSemesters.length > 0;

    return (
        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Exempt Status</Typography>
                <Switch
                    checked={exemptEnabled}
                    onChange={handleExemptToggle}
                    name="exemptToggle"
                    color="primary"
                    disabled={hasExemptSemesters}
                />
            </Box>
            {exemptEnabled && (
                <>
                    {hasExemptSemesters ? (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1">Exempt Semesters:</Typography>
                            {hasExemptSemesters ? (
                                <ul>
                                    {exemptSemesters.map(semester => (
                                        <li key={semester.SemesterID}>{semester.TermName}</li>
                                    ))}
                                </ul>
                            ) : (
                                <Typography variant="body2">No exempt semesters found.</Typography>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={onExemptUndo}
                                >
                                    Undo Exempt Status
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Start Semester</InputLabel>
                                <Select
                                    value={exemptStartSemester}
                                    onChange={(e) => setExemptStartSemester(e.target.value)}
                                    label="Start Semester"
                                >
                                    {semesters
                                        .filter(semester => {
                                            if (!activeSemester) return true;
                                            return dayjs(semester.StartDate).isSameOrAfter(dayjs(activeSemester.StartDate));
                                        })
                                        .map(semester => (
                                            <MenuItem key={semester.SemesterID} value={semester.SemesterID}>
                                                {semester.TermName}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Duration</InputLabel>
                                <Select
                                    value={exemptDuration}
                                    onChange={(e) => setExemptDuration(e.target.value)}
                                    label="Duration"
                                >
                                    <MenuItem value={1}>1 Semester</MenuItem>
                                    <MenuItem value={2}>2 Semesters</MenuItem>
                                    <MenuItem value={3}>3 Semesters</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" onClick={onExemptSubmit}>Set Exempt Status</Button>
                        </Box>
                    )}
                </>
            )}
        </Paper>
    );
};