import React, { useState, useEffect } from "react";
import {
    Typography,
    Button,
    Paper,
    Stack,
    TextField,
    Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import UniversalChatBot from "../../components/universalChatBot";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import backimg from '../assets/backimg.jpg';


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // ✅ Check token and navigate if valid
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded?.role) {
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
                password,
            });

            if (result.data.message === "Success") {
                const token = result.data.token;
                const decoded = jwtDecode(token);

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(result.data.user));
                localStorage.setItem("role", JSON.stringify(result.data.user.role));

                navigate("/dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error("Login error:", err);
        }
    };

    return (
        <>
            <Box
                sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundImage: `url(${backimg})`,

                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    m: 0,
                    p: 0,
                }}
            >
                <Stack direction="column" alignItems="center" sx={{ width: "100%", px: 2 }}>
                    <Paper
                        elevation={4}
                        sx={{
                            padding: 5,
                            width: "100%",
                            maxWidth: 400,
                            backdropFilter: "blur(8px)",
                            backgroundColor: "rgba(255,255,255,0.85)",
                            borderRadius: 2,
                        }}
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <Typography variant="h3" align="center" gutterBottom>
                            Login
                        </Typography>
                        <TextField
                            id="standard-basic1"
                            name="email"
                            label="Email"
                            variant="standard"
                            fullWidth
                            sx={{ marginTop: 4 }}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            id="standard-basic2"
                            name="password"
                            type="password"
                            label="Password"
                            variant="standard"
                            fullWidth
                            sx={{ marginTop: 4 }}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            variant="contained"
                            type="submit"
                            fullWidth
                            sx={{ marginTop: 6 }}
                        >
                            Login
                        </Button>
                    </Paper>
                </Stack>
            </Box>

            {/* ✅ Universal ChatBot stays accessible */}
            <UniversalChatBot />
        </>
    );
}
