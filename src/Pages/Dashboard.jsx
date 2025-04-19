import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import NavBar from '../../components/navBar';

export default function Dashboard() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <NavBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}