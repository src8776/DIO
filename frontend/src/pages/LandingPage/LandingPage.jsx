import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

// @Danny I just had to put something here to make the nav situation work.
//body is the white background, container is next level up, then cards
function LandingPage() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ bgcolor: "#cfe8fc", height: "100vh" }} />
      </Container>
    </React.Fragment>
  );
}

export default LandingPage();
