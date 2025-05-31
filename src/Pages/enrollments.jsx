import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Modal, Typography, Stack, TextField, Select, MenuItem, InputLabel, FormControl,
  TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function EnrollmentPage() {
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userRole, setUserRole] = useState('');

  const [formData, setFormData] = useState({
    _id: '',
    student: '',
    course: '',
    status: 'enrolled',
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) setUserRole(user.role);

    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/enrollments/getAllEnrollments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/users/getAllUserWithRoleStd', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/courses/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleOpen = () => {
    setFormData({ student: '', course: '', status: 'enrolled' });
    setIsEditMode(false);
    setOpen(true);
  };

  const handleEdit = (enrollment) => {
    setFormData({
      _id: enrollment._id,
      student: enrollment.student._id,
      course: enrollment.course._id,
      status: enrollment.status,
    });
    setIsEditMode(true);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await axios.put('http://localhost:3001/enrollments/updateEnrollmentById', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        await axios.post('http://localhost:3001/enrollments/addEnrollment', formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }
      handleClose();
      fetchEnrollments();
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  const handleDelete = async (id) => {
    if (userRole === 'student') return;
    if (window.confirm('Do you want to delete this enrollment?')) {
      try {
        await axios.delete('http://localhost:3001/enrollments/deleteEnrollmentById', {
          data: { id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchEnrollments();
      } catch (error) {
        console.error('Error deleting enrollment:', error);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        bgcolor: '#f5f5f5',
        pt: 8,
        px: { xs: 2, sm: 4, md: 6 },
        boxSizing: 'border-box',
        overflowX: 'auto',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" mb={3} fontWeight="bold">
            {isEditMode ? 'Edit Enrollment' : 'Add Enrollment'}
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>RollNo -- Student</InputLabel>
              <Select
                name="student"
                value={formData.student}
                onChange={handleChange}
                label="RollNo -- Student"
              >
                <MenuItem value="">
                  <em>Select a Student</em>
                </MenuItem>
                {students.map(student => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.studentRollNo} — {student.firstName} {student.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Course</InputLabel>
              <Select
                name="course"
                value={formData.course}
                onChange={handleChange}
                label="Course"
              >
                <MenuItem value="">
                  <em>Select a Course</em>
                </MenuItem>
                {courses.map(course => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.courseName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="enrolled">Enrolled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="dropped">Dropped</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" type="submit" fullWidth size="large" sx={{ fontWeight: 'bold' }}>
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {userRole !== 'student' && (
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            onClick={handleOpen}
            variant="contained"
            size="large"
            sx={{ fontWeight: 'bold' }}
          >
            Add Enrollment
          </Button>
        </Box>
      )}

      <TableContainer
        component={Paper}
        sx={{
          maxWidth: '1200px',
          margin: 'auto',
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{color: 'white', fontWeight: '600' }}>RN -- Student</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>Course</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>Status</TableCell>
              {userRole !== 'student' && <TableCell sx={{ color: 'white', fontWeight: '600'}}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {enrollments.map(enrollment => (
              <TableRow key={enrollment._id}>
                <TableCell>
                  {enrollment.student?.studentRollNo} — {enrollment.student?.firstName} {enrollment.student?.lastName}
                </TableCell>
                <TableCell>{enrollment.course?.courseName}</TableCell>
                <TableCell>{enrollment.status}</TableCell>
                {userRole !== 'student' && (
                  <TableCell>
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      onClick={() => handleEdit(enrollment)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(enrollment._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
