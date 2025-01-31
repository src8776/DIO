import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { CardMedia } from "@mui/material";

function LandingPage() {
  return (
    <>
      <CssBaseline />
      <Container sx={{ marginBottom: "100px" }}>
        <Typography sx={{ color: "black", fontSize: "2em" }}>
          DIO Organizations
        </Typography>
        <Box
          sx={{
            minWidth: 400,
            minHeight: 200,

            display: "inline-block",
          }}
        >
          <Card sx={{}}>
            <CardMedia
              component="img"
              sx={{
                width: "100%",
                height: 140,
                objectFit: "contain",
              }}
              image="/COMS.png"
              title="COMS"
            />
            <CardContent>
              <Typography
                gutterBottom
                sx={{
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                COMS
              </Typography>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  maxWidth: "100%",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                Computing Organization of Multicultural Students
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                Make this one Member
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="medium">Home</Button>
            </CardActions>
          </Card>
        </Box>
        <Box
          sx={{
            display: "inline-block",
            minWidth: 400,
            minHeight: 200,
          }}
        >
          <Card sx={{ marginLeft: "50px" }}>
            <CardMedia
              sx={{ height: 140 }}
              image="/Gritty_resized.jpg"
              title="WIC"
            />
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
                Make this one admin
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
