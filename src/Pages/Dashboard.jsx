import React, { useEffect, useState } from 'react';
import {
  Box,
  CssBaseline,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../../components/navBar';
import axios from 'axios';
import StudentQuestionTodo from '../../components/toDoList';
import UniversalChatBot from '../../components/universalChatBot';
import StudentOnboardingTour from '../../components/studentOnboardingTour';


export default function Dashboard() {
  const location = useLocation();
  const isRootDashboard = location.pathname.replace(/\/+$/, '') === '/dashboard';

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

  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());

  const fetchEnrolledStudents = async (userId, token) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/users/totalEnrolledStds?teacherId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.studentCount || 0;
    } catch (err) {
      console.error('Failed to fetch enrolled students:', err);
      return 0;
    }
  };

  useEffect(() => {
    if (!userId || !role || !isRootDashboard) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = { role, userId, courseId };

        if (role === 'teacher') {
          params.teacherId = userId;

          const [assignmentRes, coursesRes] = await Promise.all([
            axios.get('http://localhost:3001/dashboard/dashboardStats', {
              params,
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`http://localhost:3001/courses/getCoursesByRole?_id=${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const totalEnrolledStudents = await fetchEnrolledStudents(userId, token);

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

    if (role === 'student') {
      setQuestionsLoading(true);
      const params = { userId };
      if (Array.isArray(courseId)) {
        params['courseId[]'] = courseId;
      } else if (courseId) {
        params['courseId[]'] = courseId;
      }

      axios.get('http://localhost:3001/questions/questions', { params })
        .then(res => {
          setQuestions(res.data.questions || []);
          setCompletedIds(new Set(res.data.completedIds || []));
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
      setCompletedIds(prev => new Set([...prev, questionId]));
      await axios.post('http://localhost:3001/questions/complete', {
        userId,
        courseId,
        questionId
      });
    } catch (err) {
      console.error('Failed to mark question complete:', err);
      setCompletedIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const renderContent = () => {
    if (loading)
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress color="primary" size={50} />
        </Box>
      );
    if (error)
      return (
        <Typography
          variant="h6"
          color="error"
          sx={{ mt: 6, fontWeight: 600, textAlign: 'center' }}
        >
          {error}
        </Typography>
      );

    let statItems = [];

    if (role === 'admin') {
      statItems = [
        { title: 'Total Courses', value: stats.courses },
        { title: 'Total Teachers', value: stats.teachers },
        { title: 'Total Students', value: stats.students },
      ];
    } else if (role === 'teacher') {
      statItems = [
        { title: 'Courses Taught', value: stats.coursesCount },
        { title: 'Students Enrolled', value: stats.studentsCount },
        { title: 'Assignments Created', value: stats.assignmentsCount },
      ];
    }

    return (
      <Grid container spacing={4}>
        {statItems.map((item, idx) => (
          <StatCard key={idx} title={item.title} value={item.value} />
        ))}

        {role === 'student' && (
          <Grid item xs={12}>
            <StudentQuestionTodo
              questions={questions}
              questionsLoading={questionsLoading}
              completedIds={completedIds}
              onQuestionCheck={handleCheck}
            />
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: "'Inter', sans-serif",
        color: '#2e3a59',
      }}
    >
      <CssBaseline />
      <NavBar />
      <Box className="joyride-chatbot" sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <UniversalChatBot />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 4, md: 6 },
          maxWidth: 1100,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >


        {isRootDashboard && (
          <>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 5,
                color: '#3b4252',
                letterSpacing: '0.05em',
              }}
            >
              Dashboard Overview
            </Typography>
            {renderContent()}
          </>
        )}
        <Outlet />

      </Box>
      {role === 'student' && user?.firstLogin && <StudentOnboardingTour role={role} />}


    </Box>
  );
}

function StatCard({ title, value }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        elevation={3}
        sx={{
          minHeight: 140,
          borderRadius: 3,
          backgroundColor: '#fff',
          boxShadow:
            '0 4px 10px rgba(100, 100, 111, 0.2)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          cursor: 'default',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow:
              '0 8px 20px rgba(100, 100, 111, 0.3)',
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#2e3a59',
          fontWeight: 600,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {title}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, mt: 1 }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
