// src/components/Homepage.jsx
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { FaListAlt, FaBell, FaChartBar } from "react-icons/fa";

const Homepage = () => {
  return (
    <Container
      sx={{ textAlign: "center", mt: 12, minHeight: "27rem" }}
    >
      <Box
        sx={{
          p: 8,
          backgroundColor: "var(--color-background)",
          borderRadius: "var(--border-radius)",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          maxWidth: "50rem",
          margin: "auto",
        }}
      >
        <Typography
          variant="h2"
          sx={{ color: "var(--color-primary)", fontWeight: 500 }}
          gutterBottom
        >
          Welcome to HabiTrack
        </Typography>
        <Typography
          variant="h6"
          sx={{ mt: 4, mb: 4, color: "var(--color-text-light)" }}
          paragraph
        >
          Monitor your habits and achieve your goals with ease.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "var(--color-button-bg)",
            color: "white",
            mr: "var(--spacing-sm)",
            "&:hover": { backgroundColor: "var(--color-button-hover-bg)" },
          }}
          href="/login"
        >
          Login
        </Button>
        <Button
        size="large"
          variant="outlined"
          sx={{
            color: "var(--color-button-bg)",
            borderColor: "var(--color-button-bg)",
            "&:hover": {
              borderColor: "var(--color-button-bg)",
              backgroundColor: "rgba(245, 0, 87, 0.04)",
            },
          }}
          href="/signup"
        >
          Sign Up
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
          gap: 8,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <FaListAlt size={20} style={{ color: "var(--color-text)" }} />
          <Typography
            variant="subtitle1"
            sx={{ color: "var(--color-text)" }}
          >
            Track Habits
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <FaBell size={20} style={{ color: "var(--color-text)" }} />
          <Typography
            variant="subtitle1"
            sx={{ color: "var(--color-text)" }}
          >
            Set Reminders
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <FaChartBar size={20} style={{ color: "var(--color-text)" }} />
          <Typography
            variant="subtitle1"
            sx={{ color: "var(--color-text)" }}
          >
            Visualize Progress
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Homepage;
