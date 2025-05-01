import React, { useEffect, useState } from 'react';
import { Box, CssBaseline, Typography, Grid, Card, CardContent } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../../components/navBar';
import axios from 'axios';

export default function Dashboard() {
  const location = useLocation();
  const isRootDashboard = location.pathname.replace(/\/+$/, '') === '/dashboard';

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || null;

  const [stats, setStats] = useState({ courses: 0, teachers: 0, students: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (role !== 'admin') {
        setLoading(false); // No need to fetch if not admin
        return;
      }

      try {
        const token = localStorage.getItem('token'); // Assuming you store token separately
        const res = await axios.get('http://localhost:3001/dashboard/dashboardStats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load stats.');
      } finally {
        setLoading(false);
      }
    };

    if (isRootDashboard) fetchStats();
  }, [isRootDashboard, role]);

  const renderContent = () => {
    if (loading) {
      return <Typography variant="h6">Loading...</Typography>;
    }

    if (error) {
      return <Typography variant="h6" color="error">{error}</Typography>;
    }

    if (role === 'admin') {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ minHeight: 140 }}>
              <CardContent>
                <Typography variant="h6">Total Courses</Typography>
                <Typography variant="h4">{stats.courses}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ minHeight: 140 }}>
              <CardContent>
                <Typography variant="h6">Total Teachers</Typography>
                <Typography variant="h4">{stats.teachers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ minHeight: 140 }}>
              <CardContent>
                <Typography variant="h6">Total Students</Typography>
                <Typography variant="h4">{stats.students}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    if (role === 'teacher') {
      return <Typography variant="h5" sx={{ mt: 2 }}>Welcome, Teacher! 🎓</Typography>;
    }

    if (role === 'student') {
      return <Typography variant="h5" sx={{ mt: 2 }}>Welcome, Student! 📘</Typography>;
    }

    return <Typography>No dashboard available for your role.</Typography>;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <NavBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {isRootDashboard && (
          <>
            <Typography variant="h4" gutterBottom>
              Dashboard Overview
            </Typography>
            {renderContent()}
          </>
        )}
        <Outlet />
      </Box>
    </Box>
  );
}
