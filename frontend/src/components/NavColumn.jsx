import React from "react";
import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const NavColumn = ({ pageTitle }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", width: "200px", mt: "100px" }}>
      {/* Page Title */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>

      {/* Navigation Links */}
      <List sx={{ paddingTop: 2 }}>
        <ListItem component={Link} to="/admin" button>
          <ListItemText primary="Member Database" />
        </ListItem>
        <ListItem component={Link} to="/officersList" button>
          <ListItemText primary="Officers" />
        </ListItem>
        <ListItem component={Link} to="/organizationSetup" button>
          <ListItemText primary="Organization Setup" />
        </ListItem>
        <ListItem component={Link} to="/acctSetup" button>
          <ListItemText primary="Account Setup" />
        </ListItem>
      </List>
    </Box>
  );
};

export default NavColumn;
