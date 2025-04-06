import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import Box from "@mui/material/Box";
import Link from '@mui/material/Link';
import React from "react";

import { Routes } from "react-router"
import { Stack, TextField } from "@mui/material";


export default function Register() {
    return (
        <>
            <Container>
                <Stack direction="column" alignItems="center">
                    <Paper elevation={2} sx={{ padding: 7, backgroundColor: "#d3d3d3" }} >
                        <Typography variant="h3">Register</Typography>
                        {/* <Stack spacing={2}>  */}
                        <TextField id="standard-basic" label="First Name" variant="standard" fullWidth sx={{ marginTop: 4 }} />
                        <TextField id="standard-basic" label="Last Name" variant="standard" fullWidth sx={{ marginTop: 4 }} />
                        <TextField id="standard-basic" label="Email" variant="standard" fullWidth sx={{ marginTop: 4 }} />
                        <TextField id="standard-basic" label="Password" variant="standard" fullWidth sx={{ marginTop: 4 }} />
                        {/* </Stack> */}
                        <Button variant="contained" fullWidth sx={{ marginTop: 6 }}>Register</Button>
                        <Box sx={{ marginTop: 4 }}>
                            <Typography variant="h8" sx={{ marginRight: 1 }}>Already a User?</Typography><Link href="/" underline="none">Login</Link>
                        </Box>
                    </Paper>
                </Stack>
            </Container>
        </>
    );
}