import { Box, List, ListItem, ListItemText, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const NavColumn = ({ pageTitle, orgType }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "200px", mt: "100px" }}>
      <Typography variant="h6">
        {pageTitle}
      </Typography>

      <List sx={{ }}>
        {[
          { text: "Member Database", path: `/admin/${orgType}` },
          { text: "Officers", path: `/admin/${orgType}/officersList` },
          { text: "Organization Setup", path: `/admin/${orgType}/organizationSetup` }
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
