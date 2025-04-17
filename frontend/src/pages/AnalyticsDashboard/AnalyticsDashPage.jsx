import * as React from 'react';
import {
  Box, Container, Paper,
  Typography, CircularProgress,
  Tabs, Tab
} from '@mui/material';
import { useParams } from 'react-router-dom';
import SemesterOverviewTab from './SemesterOverviewTab';
import SemesterVsSemesterTab from './SemesterVsSemesterTab';
import YearVsYearTab from './YearVsYearTab';
import DemographicsTab from './DemographicsTab';


/**
 * AnalyticsDashPage.jsx
 * 
 * This React component serves as the main dashboard for viewing analytics related to an organization.
 * It provides multiple tabs for exploring different types of data, such as semester overviews, 
 * semester comparisons, and demographic information. The dashboard dynamically fetches and displays 
 * data based on the selected organization.
 * 
 * Key Features:
 * - Validates the organization type and displays an error message if the organization is invalid.
 * - Fetches the organization ID from the backend based on the organization abbreviation.
 * - Provides a tabbed interface for navigating between different analytics views.
 * - Displays a loading spinner while fetching data.
 * - Dynamically renders content for each tab based on the selected tab value.
 * 
 * Props:
 * - None (uses React Router's `useParams` to determine the organization).
 * 
 * Dependencies:
 * - React, Material-UI components, and React Router.
 * - Custom components: SemesterOverviewTab, SemesterVsSemesterTab, DemographicsTab.
 * 
 * Functions:
 * - handleTabChange: Updates the selected tab value when a tab is clicked.
 * - React.useEffect: Fetches the organization ID when the organization abbreviation changes.
 * 
 * Hooks:
 * - React.useState: Manages state for organization ID, loading state, and selected tab value.
 * - React.useEffect: Triggers data fetching when the organization abbreviation changes.
 * 
 * @component
 */
export default function AnalyticsDash() {
  const { org } = useParams();
  const allowedTypes = ['wic', 'coms'];
  const [orgID, setOrgID] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [tabValue, setTabValue] = React.useState(0);

  if (!allowedTypes.includes(org)) {
    return (
      <Typography component={Paper} variant='h1' sx={{ alignContent: 'center', p: 6, m: 'auto' }}>
        Organization Doesn't Exist
      </Typography>
    );
  }

  React.useEffect(() => {
    fetch(`/api/organizationInfo/organizationIDByAbbreviation?abbreviation=${org}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setOrgID(data[0].OrganizationID);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [org]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container sx={{ p: 2, display: 'flex', flexDirection: { md: 'column', lg: 'row' } }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{}}>
            <Typography variant="h5" sx={{ textAlign: 'left', display: 'inline' }}>
              Analytics Dashboard -
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'left', display: 'inline', ml: 1 }}>
              {org ? org.toUpperCase() : "Loading..."}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
            <Tabs
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
              value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
              <Tab label="Semester Overview" />
              <Tab label="Semester vs. Semester" />
              {/* <Tab label="Year vs. Year" /> */}
              <Tab label="Demographics" />
            </Tabs>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {tabValue === 0 && <SemesterOverviewTab organizationID={orgID} />}
            {tabValue === 1 && <SemesterVsSemesterTab organizationID={orgID} />}
            {/* {tabValue === 2 && <YearVsYearTab organizationID={orgID} />} */}
            {tabValue === 2 && <DemographicsTab organizationID={orgID} />}
          </Box>
        )}
      </Box>
    </Container>
  );
}