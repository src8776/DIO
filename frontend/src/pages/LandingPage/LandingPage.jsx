import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

function LandingPage() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Typography sx={{ color: "black", fontSize: "2em" }}>
          DIO Organizations
        </Typography>
        <Box
          sx={{
            bgcolor: "gray",
            height: "100vh",
            alignContent: "center",
            placeContent: "center",
          }}
        >
          <Card sx={{ maxWidth: 400, maxHeight: 400 }}>
            <CardContent>
              <Typography
                gutterBottom
                sx={{ color: "text.secondary", fontSize: 14 }}
              >
                COMS
              </Typography>
              <Typography variant="h5" component="div">
                Computing Organization for Multicultural Students
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                Member
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="medium">Home</Button>
            </CardActions>
          </Card>
          <Card sx={{ maxWidth: 400, maxHeight: 400 }}>
            <CardContent>
              <Typography
                gutterBottom
                sx={{ color: "text.secondary", fontSize: 14 }}
              >
                WIC
              </Typography>
              <Typography variant="h5" component="div">
                Women in Computing
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                Member
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="medium">Home</Button>
            </CardActions>
          </Card>
        </Box>
      </Container>
    </>
  );
}

export default LandingPage;
