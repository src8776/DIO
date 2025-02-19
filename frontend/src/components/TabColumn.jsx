import * as React from 'react';
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { Link } from "react-router-dom";

// Helper to generate accessibility props
function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function VerticalNavTabs({ pageTitle, orgType, sx }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const navItems = [
    { text: "Member Database", path: `/admin/${orgType}` },
    { text: "Officers", path: `/admin/${orgType}/officersList` },
    { text: "Organization Setup", path: `/admin/${orgType}/organizationSetup` },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", ...sx }}>
      <Typography variant="h6" sx={{ textAlign: 'center',  mt: "100px" }}>
        {/* {pageTitle} */}
      </Typography>
      <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical navigation tabs"
          sx={{ borderRight: 1, borderColor: 'divider', width: "200px" }}
        >
          {navItems.map((item, index) => (
            <Tab
              key={item.path}
              label={item.text}
              {...a11yProps(index)}
              component={Link}
              to={item.path}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

