import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { CardMedia } from "@mui/material";
import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <Container sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" >
                DIO Organizations
            </Typography>

            {/* Module Container */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* COMS Card */}
                <Card sx={{ width: 350, display: "flex", flexDirection: "column", height: 340 }}>
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
                    <CardContent sx={{ borderTop: "1px solid #f0f0f0", flexGrow: 1 }}>
                        <Typography
                            gutterBottom
                            sx={{ color: "text.secondary", fontSize: 14 }}
                        >
                            COMS
                        </Typography>
                        <Typography variant="h5">
                            Computing Organization for Multicultural Students
                        </Typography>
                        <Typography sx={{ color: "text.secondary" }}>
                            Admin
                        </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "space-between" }}>
                        <Button>View Info</Button>
                        <Button component={Link} to="/admin" variant="contained">
                            Admin Dashboard
                        </Button>
                    </CardActions>
                </Card>

                {/* WiC Card */}
                <Card sx={{ width: 350, display: "flex", flexDirection: "column", height: 340 }}>
                    <CardMedia
                        sx={{ height: 140 }}
                        image="/Gritty_resized.jpg"
                        title="WIC"
                    />
                    <CardContent sx={{ borderTop: "1px solid #f0f0f0", flexGrow: 1 }}>
                        <Typography
                            gutterBottom
                            sx={{ color: "text.secondary", fontSize: 14 }}
                        >
                            WiC
                        </Typography>

                        <Typography variant="h5">
                            Women in Computing
                        </Typography>
                        <Typography sx={{ color: "text.secondary" }}>
                            Member
                        </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "space-between" }}>
                        <Button>View Info</Button>
                    </CardActions>
                </Card>
            </Box>
        </Container>
    );
}

export default LandingPage;
