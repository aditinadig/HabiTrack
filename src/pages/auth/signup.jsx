// src/pages/auth/signup.jsx
import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { signUp } from "../../services/authService";
import "../../styles/global.css"; // Import global styles

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();
    setError(""); // Reset error before new submission

    try {
      await signUp(email, password, name); // Pass name along with email and password
      window.location.href = "/all-habits";
    } catch (error) {
      setError(error.message);
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
          Sign Up
        </Typography>
        {error && (
          <Typography
            variant="body2"
            sx={{ color: "var(--color-secondary)", mb: "var(--spacing-sm)" }}
          >
            {error}
          </Typography>
        )}
        <form onSubmit={handleSignup}>
          <TextField
            label="Name"
            type="text"
            fullWidth
            required
            variant="outlined"
            sx={{ mb: "var(--spacing-md)" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            Sign Up
          </Button>
        </form>
        <Typography
          variant="body2"
          sx={{ color: "var(--color-text-light)", mt: "var(--spacing-md)" }}
        >
          Already have an account?{" "}
          <a href="/auth/login" style={{ color: "var(--color-primary)" }}>
            Log in
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default Signup;