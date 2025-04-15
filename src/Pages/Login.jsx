import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import React from "react";
import Box from "@mui/material/Box";
import { useState } from "react";
import { Routes } from "react-router"
import { useNavigate } from "react-router-dom";
import { Stack, TextField } from "@mui/material";
import axios from "axios";

export default function Login() {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        axios.post("http://localhost:3001/auth/login", {
            email,
            password
        })
            .then(result => {
                if (result.data.message=== "Success", result.data.user.role==="admin") {
                    localStorage.setItem("token", result.data.token)
                    localStorage.setItem("user", JSON.stringify(result.data.user))
                    localStorage.setItem("role", JSON.stringify(result.data.user.role))
                    
                    navigate('/dashboard',result.data);
                } else {
                    navigate('/');
                }
            })
            .catch(err => console.log(err))
    }
// backgroundColor: "#d3d3d3"
    return (
        <>
            <Container>
                <Stack direction="column" alignItems="center">
                    <Paper elevation={4} sx={{ padding: 7 }} component="form" onSubmit={handleSubmit}>
                        <Typography variant="h3">Login</Typography>
                        {/* <Stack spacing={2}>  */}
                        <TextField id="standard-basic1" name="email" label="Email" variant="standard" fullWidth sx={{ marginTop: 4 }} onChange={(e) => setEmail(e.target.value)} />

                        <TextField id="standard-basic2" name="password" label="Password" variant="standard" fullWidth sx={{ marginTop: 4 }} onChange={(e) => setPassword(e.target.value)} />
                        {/* </Stack> */}
                        <Button variant="contained" type="submit" fullWidth sx={{ marginTop: 6 }}>Login</Button>

                        <Box sx={{ marginTop: 4 }}>
                            <Typography variant="h8" sx={{ marginRight: 1 }}>Not a User?</Typography><Link href="/register" underline="none">Register</Link>
                        </Box>
                    </Paper>
                </Stack>
            </Container>
        </>
    );
}