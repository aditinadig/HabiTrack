// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { logIn } from "../../services/authService";
import "../../styles/global.css"; // Import global styles

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(""); // Reset error before new submission

    try {
      await logIn(email, password);
      // Redirect to homepage or dashboard upon successful login
      window.location.href = "/all-habits";
    } catch (error) {
      setError(error.message); // Display error message if login fails
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ textAlign: "center", mt: "var(--spacing-xl)" }}
    >
      <Box
        sx={{
          p: "var(--spacing-lg)",
          backgroundColor: "var(--color-background)",
          borderRadius: "var(--border-radius)",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "var(--color-primary)", mb: "var(--spacing-md)" }}
        >
          Log In
        </Typography>
        {error && (
          <Typography
            variant="body2"
            sx={{ color: "var(--color-secondary)", mb: "var(--spacing-sm)" }}
          >
            {error}
          </Typography>
        )}
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            variant="outlined"
            sx={{ mb: "var(--spacing-md)" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            variant="outlined"
            sx={{ mb: "var(--spacing-md)" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "var(--color-button-bg)",
              "&:hover": {
                backgroundColor: "var(--color-button-hover-bg)",
              },
              mb: "var(--spacing-md)",
            }}
          >
            Log In
          </Button>
        </form>
        <Typography
          variant="body2"
          sx={{ color: "var(--color-text-light)", mt: "var(--spacing-md)" }}
        >
          Don’t have an account?{" "}
          <a href="/auth/signup" style={{ color: "var(--color-primary)" }}>
            Sign up
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;