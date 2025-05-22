import React, { useState, useEffect } from "react";
import {
    Container, Typography, Button, Paper, Stack, TextField
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // ✅ Check token and navigate if valid
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded?.role) {
                    //navigating to dashboard of users
                    
                    navigate("/dashboard");
                }
            } catch (err) {
                localStorage.clear(); // Remove invalid token
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post("http://localhost:3001/auth/login", {
                email,
                password
            });

            if (result.data.message === "Success") {
                const token = result.data.token;
                const decoded = jwtDecode(token); // ✅ decode token if needed

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(result.data.user));
                localStorage.setItem("role", JSON.stringify(result.data.user.role));

                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error("Login error:", err);
        }
    };


    return (
        <>
            <Container>
                <Stack direction="column" alignItems="center">
                    <Paper elevation={4} sx={{ padding: 7 }} component="form" onSubmit={handleSubmit}>
                        <Typography variant="h3">Login</Typography>
                        {/* <Stack spacing={2}>  */}
                        <TextField id="standard-basic1" name="email" label="Email" variant="standard" fullWidth sx={{ marginTop: 4 }} onChange={(e) => setEmail(e.target.value)} />

                        <TextField id="standard-basic2" name="password" type="password" label="Password" variant="standard" fullWidth sx={{ marginTop: 4 }} onChange={(e) => setPassword(e.target.value)} />
                        {/* </Stack> */}
                        <Button variant="contained" type="submit" fullWidth sx={{ marginTop: 6 }}>Login</Button>
                    </Paper>
                </Stack>
            </Container>
        </>
    );
}
