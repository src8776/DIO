import React from "react";
import { Container, Skeleton } from "@mui/material";
import AddRoundedIcon from '@mui/icons-material/AddRounded';

export default function AddClubCard() {
    return (
        <Container 
            sx={{ 
                width: 350, 
                height: 340, 
                border: "dashed", 
                borderRadius: 2, 
                borderColor: "green", 
                borderWidth: 2, 
                borderStyle: "dashed", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                m: 0,
                opacity: 0.8 
            }}
        >
            <Skeleton 
                variant="rectangular" 
                width={350} 
                height={340} 
                sx={{ 
                    // bgcolor: "rgb(211, 230, 216)",
                    position: "absolute", 
                    borderRadius: 2 
                }} 
            />
            <AddRoundedIcon 
                sx={{ 
                    fontSize: 100, 
                    color: "green",
                    opacity: 0.8 
                }} 
            />
        </Container>
    );
}