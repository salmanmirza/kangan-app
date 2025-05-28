import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Modal, Typography, Stack, TextField,
    TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

export default function EnrollmentPage() {
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        _id: '',
        student: '',
        course: '',
        status: 'enrolled',
    });

    useEffect(() => {
        fetchEnrollments();
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchEnrollments = async () => {
        const response = await axios.get('http://localhost:3001/enrollments/getAllEnrollments', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        setEnrollments(response.data);
    };

    const fetchStudents = async () => {
        const response = await axios.get('http://localhost:3001/users/getAllUserWithRoleStd', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        setStudents(response.data);
    };

    const fetchCourses = async () => {
        const response = await axios.get('http://localhost:3001/courses/all', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        setCourses(response.data);
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
        setFormData((prev) => ({
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
        if (window.confirm('Do you want to delete this enrollment?')) {
            await axios.delete('http://localhost:3001/enrollments/deleteEnrollmentById', {
                data: { id },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            fetchEnrollments();
        }
    };

    return (
        <Box
            sx={{
                px: 3,
                pt: '80px', // space for navbar height
                minHeight: 'calc(100vh - 80px)',
                bgcolor: '#f9fafb', // dashboard background color
            }}
        >
            <Box
                sx={{
                    maxWidth: 1200,
                    mx: 'auto',
                    bgcolor: 'white',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 1,
                    minHeight: 'calc(100vh - 140px)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Add Enrollment Button */}
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button variant="contained" onClick={handleOpen}>
                        Add Enrollment
                    </Button>
                </Box>

                {/* Enrollment Table */}
                <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ minWidth: 300 }}>RN -- Student</TableCell>
                                <TableCell sx={{ minWidth: 200 }}>Course</TableCell>
                                <TableCell sx={{ minWidth: 120 }}>Status</TableCell>
                                <TableCell sx={{ minWidth: 280 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {enrollments.map((enrollment) => (
                                <TableRow key={enrollment._id} hover>
                                    <TableCell>
                                        {enrollment.student?.studentRollNo} — {enrollment.student?.firstName}{' '}
                                        {enrollment.student?.lastName}
                                    </TableCell>
                                    <TableCell>{enrollment.course?.courseName}</TableCell>
                                    <TableCell>{enrollment.status}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="info"
                                            size="small"
                                            sx={{ mr: 1 }}
                                            onClick={() => handleEdit(enrollment)}
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Modal for Add/Edit */}
                <Modal open={open} onClose={handleClose}>
                    <Box component="form" onSubmit={handleSubmit} sx={modalStyle}>
                        <Typography variant="h6" mb={2}>
                            {isEditMode ? 'Edit Enrollment' : 'Add Enrollment'}
                        </Typography>

                        <Stack spacing={2}>
                            {/* Student Dropdown */}
                            <TextField
                                name="student"
                                label="RollNo--Student"
                                select
                                value={formData.student}
                                onChange={handleChange}
                                fullWidth
                                SelectProps={{ native: true }}
                                required
                            >
                                <option value="">Select a student</option>
                                {students.map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.studentRollNo} — {student.firstName} {student.lastName}
                                    </option>
                                ))}
                            </TextField>

                            {/* Course Dropdown */}
                            <TextField
                                name="course"
                                label="Course"
                                select
                                value={formData.course}
                                onChange={handleChange}
                                fullWidth
                                SelectProps={{ native: true }}
                                required
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.courseName}
                                    </option>
                                ))}
                            </TextField>

                            {/* Status Dropdown */}
                            <TextField
                                name="status"
                                label="Status"
                                select
                                value={formData.status}
                                onChange={handleChange}
                                fullWidth
                                SelectProps={{ native: true }}
                                required
                            >
                                <option value="enrolled">Enrolled</option>
                                <option value="completed">Completed</option>
                                <option value="dropped">Dropped</option>
                            </TextField>

                            <Button variant="contained" type="submit" fullWidth>
                                {isEditMode ? 'Update' : 'Add'}
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
            </Box>
        </Box>
    );
}
