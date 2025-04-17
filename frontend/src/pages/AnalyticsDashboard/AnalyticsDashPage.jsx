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