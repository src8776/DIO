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