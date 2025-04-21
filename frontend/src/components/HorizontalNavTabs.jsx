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

/**
 * HorizontalNavTabs.jsx
 * 
 * This React component renders a horizontal navigation bar with tabs for navigating between different sections
 * of the admin dashboard. It dynamically highlights the active tab based on the current URL path and provides
 * links to various admin pages.
 * 
 * Key Features:
 * - Displays a horizontal tab navigation bar with scrollable tabs.
 * - Dynamically updates the active tab based on the current URL path.
 * - Provides links to admin pages such as "Analytics Dashboard," "Member Database," "Officers," and "Organization Setup."
 * - Supports responsive design with scrollable tabs for smaller screens.
 * 
 * Props:
 * - orgType: String representing the organization type (e.g., "wic" or "coms") used to generate navigation paths.
 * 
 * Dependencies:
 * - React, Material-UI components.
 * - React Router for navigation and location tracking.
 * 
 * Functions:
 * - accessibilityProps: Generates accessibility attributes for each tab.
 * - handleChange: Updates the active tab when a new tab is selected.
 * 
 * Hooks:
 * - React.useState: Manages the state of the currently active tab.
 * - React.useEffect: Updates the active tab based on the current URL path.
 * - React Router's `useLocation`: Tracks the current URL path for dynamic tab highlighting.
 * 
 * @component
 */
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

