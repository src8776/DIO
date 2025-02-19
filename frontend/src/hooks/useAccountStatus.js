import { useState, useEffect } from 'react';
import { determineMembershipStatusModular } from '../utils/membershipStatus';

const useAccountStatus = (orgID, memberID) => {
    const [activeRequirement, setActiveRequirement] = useState('');
    const [requirementType, setRequirementType] = useState('');
    const [userAttendance, setUserAttendance] = useState([]);
    const [statusObject, setStatusObject] = useState({});

    useEffect(() => {
        // Fetch all required data concurrently.
        Promise.all([
            fetch(`/api/organizationInfo/activeRequirement?organizationID=${orgID}`).then(res => res.json()),
            fetch(`/api/organizationRules/eventRules?organizationID=${orgID}`).then(res => res.json()),
            fetch(`/api/memberDetails/attendance?memberID=${memberID}&organizationID=${orgID}`).then(res => res.json())
        ])
            .then(([activeReqData, orgRulesData, attendanceData]) => {
                // Process activeRequirement data.
                if (activeReqData.length > 0) {
                    setActiveRequirement(activeReqData[0].ActiveRequirement);
                    setRequirementType(activeReqData[0].Description);
                } else {
                    setActiveRequirement(null);
                    setRequirementType(null);
                }

                // Process organization rules (event types)
                const rules = orgRulesData.eventTypes;

                // Process user's attendance data.
                const attendanceRecords = attendanceData.length > 0 ? attendanceData[0].attendanceRecord : [];
                setUserAttendance(attendanceRecords);

                // Once all data is available, call the algorithm.
                if (rules && attendanceRecords.length > 0 && activeReqData[0]?.ActiveRequirement) {
                    const status = determineMembershipStatusModular(
                        attendanceRecords,
                        { eventTypes: rules },
                        activeReqData[0].ActiveRequirement
                    );
                    setStatusObject(status);
                }
            })
            .catch(error => console.error('Error fetching account data:', error));
    }, [orgID, memberID]);

    return { activeRequirement, requirementType, userAttendance, statusObject };
};

export default useAccountStatus;