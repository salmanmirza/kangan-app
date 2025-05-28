// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Box, CssBaseline, Typography, Grid, Card, CardContent } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../../components/navBar';
import axios from 'axios';
import StudentQuestionTodo from '../../components/toDoList';
import NotificationsIcon from '@mui/icons-material/Notifications';
import UniversalChatBot from '../../components/universalChatBot';

export default function Dashboard() {
  const location = useLocation();
  const isRootDashboard = location.pathname.replace(/\/+$/, '') === '/dashboard';
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || null;
  const courseId = user?.course || user.courses || null;
  const userId = user?._id || null;

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
    if (!user?._id || !role || !isRootDashboard) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = { role, userId: user._id, courseId: user.courses || user.course };

        if (role === 'teacher') {
          params.teacherId = user._id;

          const [assignmentRes, coursesRes] = await Promise.all([
            axios.get('http://localhost:3001/dashboard/dashboardStats', {
              params,
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`http://localhost:3001/courses/getCoursesByRole?_id=${user._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const totalEnrolledStudents = await fetchEnrolledStudents(user._id, token);

          setStats({
            coursesCount: coursesRes.data.length || 0,
            assignmentsCount: assignmentRes.data.totalAssignments || 0,
            studentsCount: totalEnrolledStudents,
          });
        } else if (role === 'admin') {
          const res = await axios.get('http://localhost:3001/dashboard/dashboardStats', {
            params,
            headers: { Authorization: `Bearer ${token}` },
          });
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load stats.');
      } finally {
        setLoading(false);
      }
    };

    // Student section - updated for todo list functionality
    if (role === 'student') {
      setQuestionsLoading(true);
      
      // Fix parameter naming to match what the server expects
      const params = { userId };
      if (Array.isArray(courseId)) {
        params['courseId[]'] = courseId;
      } else if (courseId) {
        params['courseId[]'] = courseId;
      }
      
      axios.get('http://localhost:3001/questions/questions', { params })
        .then(res => {
          setQuestions(res.data.questions || []);
          
          // Create a Set from completed questions
          if (res.data.completedIds) {
            setCompletedIds(new Set(res.data.completedIds));
          } else {
            // Fallback if completedIds not provided directly
            const completed = new Set(
              (res.data.questions || [])
                .filter(q => q.completed)
                .map(q => q.id)
            );
            setCompletedIds(completed);
          }
        })
        .catch(err => {
          console.error('Error fetching questions:', err);
          setQuestions([]);
          setCompletedIds(new Set());
        })
        .finally(() => setQuestionsLoading(false));
    }

    fetchStats();
  }, [isRootDashboard]);

  // Question completion handler for student/teacher// todo list
  async function handleCheck(questionId) {
    if (questionsLoading || completedIds.has(questionId)) return;
    
    try {
      // Optimistically update UI
      setCompletedIds(prev => new Set([...prev, questionId]));
      
      // Send request to mark question complete
      await axios.post('http://localhost:3001/questions/complete', { 
        userId, 
        courseId, 
        questionId 
      });
      
    } catch (error) {
      console.error('Failed to mark question complete:', error);
      // Revert UI on error
      setCompletedIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(questionId);
        return newSet;
      });
    }
  }

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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StudentQuestionTodo 
              questions={questions}
              questionsLoading={questionsLoading}
              completedIds={completedIds}
              onQuestionCheck={handleCheck}
            />
          </Grid>
        </Grid>
      );
    }

    return <Typography>No dashboard AVAILABLE for your role.</Typography>;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <NavBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
      <UniversalChatBot />
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