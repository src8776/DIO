import * as React from 'react';
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

// Helper to generate accessibility props
function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function VerticalNavTabs({ pageTitle, orgType, sx }) {
  const location = useLocation();
  const [value, setValue] = React.useState(0);

  const navItems = [
    { text: "Member Database", path: `/admin/${orgType}` },
    { text: "Officers", path: `/admin/${orgType}/officersList` },
    { text: "Organization Setup", path: `/admin/${orgType}/organizationSetup` },
  ];

  React.useEffect(() => {
    const currentPath = location.pathname;
    const currentIndex = navItems.findIndex(item => item.path === currentPath);
    if (currentIndex !== -1) {
      setValue(currentIndex);
    }
  }, [location.pathname, navItems]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", ...sx }}>
      <Typography variant="h6" sx={{ textAlign: 'center', mt: "80px" }}>
        {/* {pageTitle} */}
      </Typography>
      <Box sx={{ display: 'flex', flexGrow: 1, bgcolor: 'background.paper', }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical navigation tabs"
          sx={{
            borderLeft: 1, borderColor: 'divider', width: "200px",
            '& .MuiTabs-indicator': {
              left: 0,
              right: 'auto'
            },
          }}
        >
          {navItems.map((item, index) => (
            <Tab
              key={item.path}
              label={item.text}
              {...a11yProps(index)}
              component={Link}
              to={item.path}
              sx={{ alignItems: 'flex-start' }}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

