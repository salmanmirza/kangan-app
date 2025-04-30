import React from 'react';
import { Box, CssBaseline, Typography } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../../components/navBar';

export default function Dashboard() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role?.toLowerCase() || '';

  // Set role-based message
  let welcomeMessage = '';
  if (role === 'admin') {
    welcomeMessage = 'Welcome Admin';
  } else if (role === 'teacher') {
    welcomeMessage = 'Welcome Teacher';
  } else if (role === 'student') {
    welcomeMessage = 'Welcome Student';
  } else {
    welcomeMessage = 'Welcome to Dashboard';
  }

  const showWelcome = location.pathname === '/dashboard';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <NavBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {showWelcome && (
          <Typography variant="h4" gutterBottom>
            {welcomeMessage}
          </Typography>
        )}
        <Outlet />
      </Box>
    </Box>
  );
}
