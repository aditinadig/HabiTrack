// Header.jsx
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { logOut } from '../../services/authService';

// Helper function to get cookies
const getCookie = (name) => {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
};

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in by looking for a user_id cookie
  useEffect(() => {
    const userId = getCookie("user_id");
    if (userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => { logOut(); window.location.href = "/"; };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: "var(--color-primary)", fontWeight: 600, cursor: "pointer" }} onClick={() => (isLoggedIn ? window.location.href = "/all-habits" : window.location.href = "/")}>
          HabiTrack
        </Typography>
        <Box>
          {isLoggedIn ? (
            // Links for logged-in users
            <>
              <Button variant="link" color="inherit" onClick={() => (window.location.href = "/create-habit")}>Create New Habit</Button>
              <Button variant="link" color="inherit" onClick={() => (window.location.href = "/all-habits")}>All Habits</Button>
              <Button variant="link" color="inherit" onClick={() => (window.location.href = "/set-reminder")}>Set Reminder</Button>
              <Button variant="link" color="inherit" onClick={() => (window.location.href = "/history")}>History & Analysis</Button>
              <Button variant="link" color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            // Default links for non-logged-in users
            <>
              <Button color="inherit" onClick={() => (window.location.href = "/")}>Home</Button>
              <Button color="inherit" onClick={() => (window.location.href = "#features")}>Features</Button>
              <Button color="inherit" onClick={() => (window.location.href = "#contact")}>Contact</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;