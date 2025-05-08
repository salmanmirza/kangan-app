import React, { useEffect, useState } from 'react';
import { Box, CssBaseline, Typography, Grid, Card, CardContent } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../../components/navBar';
import axios from 'axios';
import StudentTodoSimpleCard from '../../components/toDoList';
import NotificationsIcon from '@mui/icons-material/Notifications';
<NotificationsIcon fontSize="small" sx={{ mr: 1 }} />

export default function Dashboard() {
  const location = useLocation();
  const isRootDashboard = location.pathname.replace(/\/+$/, '') === '/dashboard';

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || null;

  const [stats, setStats] = useState({
    coursesCount: 0,
    studentsCount: 0,
    assignmentsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Function: Only for teachers — get total enrolled students
  const fetchEnrolledStudents = async (userId, token) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/users/totalEnrolledStds?teacherId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.studentCount || 0;
    } catch (err) {
      console.error('Failed to fetch enrolled students:', err);
      return 0;
    }
  };

  // ✅ useEffect: Fetch dashboard stats conditionally
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?._id || !role || !isRootDashboard) return;

      try {
        const token = localStorage.getItem('token');
        const params = { role };

        if (role === 'teacher') {
          params.teacherId = user._id;

          // Fetch assignments and courses in parallel
          const [assignmentRes, coursesRes] = await Promise.all([
            axios.get('http://localhost:3001/dashboard/dashboardStats', {
              params,
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`http://localhost:3001/courses/getCoursesByRole?_id=${user._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          // ✅ Only fetch student count for teachers
          const totalEnrolledStudents = await fetchEnrolledStudents(user._id, token);

          setStats({
            coursesCount: coursesRes.data.length || 0,
            assignmentsCount: assignmentRes.data.totalAssignments || 0,
            studentsCount: totalEnrolledStudents,
          });
        } else if (role === 'admin') { // || role === 'student'
          const res = await axios.get('http://localhost:3001/dashboard/dashboardStats' , {
            params,
            headers: { Authorization: `Bearer ${token}` },
          });
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load stats.' );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isRootDashboard, role, user?._id]);

  // ✅ Dashboard content renderer
  const renderContent = () => {
    if (loading) return <Typography variant="h6">Loading....</Typography>;
    if (error) return <Typography variant="h6" color="error">{error}</Typography>;

    if (role === 'admin') {
      return (
        <Grid container spacing={3}>
          <StatCard title="Total Courses" value={stats.courses} />
          <StatCard title="Total Teachers" value={stats.teachers} />
          <StatCard title="Total Students" value={stats.students} />
        </Grid>
      );
    }

    if (role === 'teacher') {
      return (
        <Grid container spacing={3}>
          <StatCard title="Total Courses Taught" value={stats.coursesCount} />
          <StatCard title="Total Students Enrolled" value={stats.studentsCount} />
          <StatCard title="Total Assignments Created" value={stats.assignmentsCount} />
        </Grid>
      );
    }

    if (role === 'student') {
      return (
        <Grid item xs={12}>
          <StudentTodoSimpleCard />
        </Grid>
      );
    }

    return <Typography>No dashboard AVAILABLE for your role.</Typography>;
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

// ✅ Reusable stat card component
function StatCard({ title, value }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ minHeight: 140 }}>
        <CardContent>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="h4">{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
