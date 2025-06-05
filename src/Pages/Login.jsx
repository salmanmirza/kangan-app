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
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import backimg from "../assets/backimage.jpeg";
import UniversalChatBot from "../../components/universalChatBot";

const roles = [
  { label: "Student", value: "student", emoji: "🎓" },
  { label: "Teacher", value: "teacher", emoji: "📚" },
  { label: "Admin", value: "admin", emoji: "🛡️" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.role) {
          navigate("/dashboard");
        }
      } catch (err) {
        localStorage.clear();
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
        role,
      });

      if (result.data.message === "Success") {
        const token = result.data.token;
        const decoded = jwtDecode(token);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        localStorage.setItem("role", result.data.user.role);
        console.log("user first login:", result.data.user);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Check credentials or server.");
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack direction="column" alignItems="center" sx={{ px: 2, width: "100%" }}>
          <Paper
            elevation={5}
            sx={{
              p: 4,
              width: "100%",
              maxWidth: 420,
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 3,
            }}
            component="form"
            onSubmit={handleSubmit}
          >
            <Typography variant="h4" align="center" gutterBottom>
              Login
            </Typography>

            {/* Role Selector */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ my: 3 }}>
              {roles.map((r) => (
                <Paper
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  elevation={role === r.value ? 6 : 2}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    backgroundColor: role === r.value ? "primary.main" : "white",
                    color: role === r.value ? "white" : "black",
                    width: 100,
                    textAlign: "center",
                    borderRadius: 2,
                    transition: "0.3s",
                  }}
                >
                  <Typography variant="h4">{r.emoji}</Typography>
                  <Typography variant="subtitle2">{r.label}</Typography>
                </Paper>
              ))}
            </Stack>

            <TextField
              label="Email"
              variant="standard"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              label="Password"
              type="password"
              variant="standard"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button variant="contained" type="submit" fullWidth sx={{ mt: 1 }}>
              Login
            </Button>
          </Paper>
        </Stack>
      </Box>

      {/* Chatbot always available */}
      <UniversalChatBot />
    </>
  );
}
