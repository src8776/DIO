import { useState, useEffect } from 'react';
import { determineMembershipStatusModular } from '../utils/membershipStatus';

/**
 * useAccountStatus.js
 * 
 * This custom React hook fetches and processes data related to a member's account status within an organization.
 * It retrieves active requirements, event rules, and attendance records, and calculates the membership status
 * using a modular algorithm.
 * 
 * Key Features:
 * - Fetches active requirements, event rules, and attendance records concurrently from the backend.
 * - Processes and stores active requirements and their descriptions.
 * - Stores the user's attendance records for the current semester.
 * - Calculates the membership status using the `determineMembershipStatusModular` utility function.
 * - Handles errors and provides default values when data is insufficient.
 * 
 * Parameters:
 * - orgID: String or number representing the organization ID.
 * - memberID: String representing the member's ID.
 * - semester: Object containing details about the current semester (e.g., `SemesterID`, `TermCode`).
 * 
 * Returns:
 * - activeRequirement: The active requirement value for the organization.
 * - requirementType: The description of the active requirement.
 * - userAttendance: Array of attendance records for the member.
 * - statusObject: Object representing the calculated membership status.
 * 
 * Dependencies:
 * - React's `useState` and `useEffect` hooks.
 * - Utility function: `determineMembershipStatusModular` for calculating membership status.
 * 
 * @hook
 */
const useAccountStatus = (orgID, memberID, semester) => {
    const [activeRequirement, setActiveRequirement] = useState('');
    const [requirementType, setRequirementType] = useState('');
    const [userAttendance, setUserAttendance] = useState([]);
    const [statusObject, setStatusObject] = useState({});

    useEffect(() => {
        // Fetch all required data concurrently.
        Promise.all([
            fetch(`/api/organizationInfo/activeRequirement?organizationID=${orgID}&semesterID=${semester.SemesterID}`).then(res => res.json()),
            fetch(`/api/organizationRules/eventRules?organizationID=${orgID}&semesterID=${semester.SemesterID}`).then(res => res.json()),
            fetch(`/api/memberDetails/attendance?memberID=${memberID}&organizationID=${orgID}&termCode=${semester.TermCode}`).then(res => res.json())
        ])
            .then(([activeReqData, orgRulesData, attendanceData]) => {
                // Process activeRequirement data.
                if (Array.isArray(activeReqData) && activeReqData.length > 0) {
                    setActiveRequirement(activeReqData[0].ActiveRequirement || null);
                    setRequirementType(activeReqData[0].Description || null);
                } else {
                    setActiveRequirement(null);
                    setRequirementType(null);
                }

                // Process organization rules (event types)
                const rules = orgRulesData?.eventTypes || [];

                // Process user's attendance data.
                const attendanceRecords = attendanceData?.[0]?.attendanceRecord || [];
                setUserAttendance(attendanceRecords);

                // Once all data is available, call the algorithm.
                if (rules.length > 0 && attendanceRecords.length > 0 && activeReqData?.[0]?.ActiveRequirement) {
                    const status = determineMembershipStatusModular(
                        attendanceRecords,
                        { eventTypes: rules },
                        activeReqData[0].ActiveRequirement
                    );
                    setStatusObject(status);
                } else {
                    // Set a default empty status object when data is insufficient.
                    setStatusObject({});
                }
            })
            .catch(error => console.error('Error fetching account data:', error));
    }, [orgID, memberID]);

    return { activeRequirement, requirementType, userAttendance, statusObject };
};

export default useAccountStatus;