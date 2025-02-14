<>
{/* raw-dogged org rules */}
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Event Type</TableCell>
                <TableCell>Point Value</TableCell>
                <TableCell>Rate</TableCell>
            </TableRow>
        </TableHead>
        <TableRow sx={{ borderBottom: "2px solid #000" }}>
            <TableCell >General Meeting</TableCell>
        </TableRow>
        <TableRow>
            <TableCell></TableCell>
            {/* First Cell (Points) */}
            <TableCell sx={{ width: "150px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField size="small" sx={{ width: "50px" }} />
                    <Typography>point(s)</Typography>
                </Box>
            </TableCell>
            {/* Second Cell (Per Meeting) */}
            <TableCell sx={{ width: "200px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>per meeting</Typography>
                </Box>
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell></TableCell>
            {/* First Cell (Points) */}
            <TableCell sx={{ width: "150px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField sx={{ width: "50px" }} />
                    <Typography>point(s)</Typography>
                </Box>
            </TableCell>
            {/* Second Cell (Per Meeting) */}
            <TableCell sx={{ width: "200px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField sx={{ width: "50px" }} />
                    <Typography>% attended</Typography>
                </Box>
            </TableCell>
        </TableRow>
        <TableRow sx={{ borderBottom: "2px solid #000" }}>
            <TableCell >Volunteering</TableCell>
        </TableRow>
        <TableRow>
            <TableCell></TableCell>
            {/* First Cell (Points) */}
            <TableCell sx={{ width: "150px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField sx={{ width: "50px" }} />
                    <Typography>points</Typography>
                </Box>
            </TableCell>
            {/* Second Cell (Per Meeting) */}
            <TableCell sx={{ width: "200px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField sx={{ width: "50px" }} />
                    <Typography>-</Typography>
                    <TextField sx={{ width: "50px" }} />
                    <Typography>hours</Typography>
                </Box>
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell></TableCell>
            {/* First Cell (Points) */}
            <TableCell sx={{ width: "150px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField sx={{ width: "50px" }} />
                    <Typography>points</Typography>
                </Box>
            </TableCell>
            {/* Second Cell (Per Meeting) */}
            <TableCell sx={{ width: "200px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField sx={{ width: "50px" }} />
                    <Typography>-</Typography>
                    <TextField sx={{ width: "50px" }} />
                    <Typography>hours</Typography>
                </Box>
            </TableCell>
        </TableRow>
    </Table>


{/* award stuff */}
    <Box
        sx={{
            background: "linear-gradient(135deg, gold, orange)", // Gold gradient
            borderRadius: 3,
            p: 2,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", // Soft shadow for depth
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            textTransform: "uppercase",
            border: "3px solid rgba(255, 215, 0, 0.8)", // Golden border
        }}
    >
        <Typography
            variant="h5"
            sx={{
                fontFamily: "'Cinzel', serif", // Fancy award-like font
                letterSpacing: 1,
                textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)", // Elegant text glow
            }}
        >
            Outstanding Achievement
        </Typography>
    </Box>
</>