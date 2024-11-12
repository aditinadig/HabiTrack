// Footer.jsx
import React from 'react';
import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 8, p: 2, borderTop: '1px solid #e0e0e0' }}>
      <Typography variant="body2">
        <Link href="#" color="inherit">Privacy Policy</Link> | <Link href="#" color="inherit">Terms of Service</Link>
      </Typography>
      <Box sx={{ mt: 2}}>
        <Link href="#" color="inherit" sx={{ mx: 1 }}>Facebook</Link>
        <Link href="#" color="inherit" sx={{ mx: 1 }}>Twitter</Link>
        <Link href="#" color="inherit" sx={{ mx: 1 }}>Instagram</Link>
      </Box>
    </Box>
  );
};

export default Footer;