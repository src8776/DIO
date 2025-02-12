import { Box, List, ListItem, ListItemText, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const NavColumn = ({ pageTitle, orgType }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", width: "200px", mt: "100px" }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {pageTitle}
      </Typography>

      <List sx={{ }}>
        {[
          { text: "Member Database", path: "/admin" },
          { text: "Officers", path: "/officersList" },
          { text: "Organization Setup", path: "/organizationSetup" },
          { text: "Account Settings", path: "/acctSetup" }
        ].map((item) => (
          <ListItem key={item.path}>
            <Button
              component={Link}
              to={item.path}
              fullWidth
              sx={{ justifyContent: "flex-start", textTransform: "none" }}
            >
              <ListItemText primary={item.text} />
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default NavColumn;
