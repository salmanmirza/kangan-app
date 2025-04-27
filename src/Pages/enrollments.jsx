import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Modal, Typography, Stack, TextField,
    TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 4,
    p: 4,
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
        status: 'enrolled', // Default status
    });

    // Fetch Enrollments, Students, and Courses
    useEffect(() => {
        fetchEnrollments();
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchEnrollments = async () => {
        const response = await axios.get('http://localhost:3001/enrollments/getAllEnrollments');
        setEnrollments(response.data);
    };

    const fetchStudents = async () => {
        const response = await axios.get('http://localhost:3001/users/getAllUserWithRoleStd');
        setStudents(response.data);
    };

    const fetchCourses = async () => {
        const response = await axios.get('http://localhost:3001/courses/all');
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
            student: enrollment.student._id, // Assuming student is an object
            course: enrollment.course._id, // Assuming course is an object
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
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditMode) {
                await axios.put('http://localhost:3001/enrollments/updateEnrollmentById', formData);
            } else {
                await axios.post('http://localhost:3001/enrollments/addEnrollment', formData);
            }

            handleClose();
            fetchEnrollments();
        } catch (error) {
            console.error('Error in form submission:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Do you want to delete this enrollment?')) {
            const data = { id };
            const url = 'http://localhost:3001/enrollments/deleteEnrollmentById';
            await axios.delete(url, { data });
            fetchEnrollments();
        }
    };

    return (
        <Box>
            <Modal open={open} onClose={handleClose}>
                <Box sx={style} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6">{isEditMode ? 'Edit Enrollment' : 'Add Enrollment'}</Typography>
                    <Stack spacing={2} mt={2}>
                        {/* Student Dropdown */}
                        <TextField
                            name="student"
                            label="RollNo--Student"
                            select
                            value={formData.student}
                            onChange={handleChange}
                            fullWidth
                            SelectProps={{ native: true }}
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
                        >
                            <option value="enrolled">Enrolled</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                        </TextField>

                        <Button variant="contained" type="submit">
                            {isEditMode ? 'Update' : 'Add'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            {/* Add Enrollment Button */}
            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button onClick={handleOpen} variant="contained">Add Enrollment</Button>
            </Box>

            {/* Enrollment Table */}
            <TableContainer component={Paper} sx={{ marginTop: 3, minWidth: 1100 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>RN--Student</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {enrollments.map((enrollment) => (
                            <TableRow key={enrollment._id}>
                                <TableCell>{enrollment.student?.studentRollNo} — {enrollment.student?.firstName} {enrollment.student?.lastName}</TableCell>
                                <TableCell>{enrollment.course?.courseName}</TableCell>
                                <TableCell>{enrollment.status}</TableCell>
                                <TableCell>
                                    <Button variant="contained" color="info" onClick={() => handleEdit(enrollment)}>Edit</Button> |
                                    <Button variant="contained" color="error" onClick={() => handleDelete(enrollment._id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
