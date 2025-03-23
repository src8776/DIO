import * as React from 'react';
import { Box, Tabs, Tab } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

// Helper to generate accessibility props
function accessibilityProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function HorizontalNavTabs({ orgType }) {
  const location = useLocation();
  const [value, setValue] = React.useState(0);

  const navItems = [
    { text: "Analytics Dashboard", path: `/admin/${orgType}` },
    { text: "Member Database", path: `/admin/${orgType}/adminDash` },
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
    <Box sx={{ pt: 1 }}>
      <Tabs
        orientation="horizontal"
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        value={value}
        onChange={handleChange}
        aria-label="Horizontal navigation tabs"
      >
        {navItems.map((item, index) => (
          <Tab
            key={item.path}
            label={item.text}
            {...accessibilityProps(index)}
            component={Link}
            to={item.path}
          />
        ))}
      </Tabs>
    </Box>
  );
};

