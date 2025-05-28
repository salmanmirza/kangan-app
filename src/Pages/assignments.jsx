import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Modal, Typography, Stack, TextField, Select, MenuItem, InputLabel, FormControl,
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

export default function Assignments() {
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({
        _id: '',
        title: '',
        description: '',
        course: '',
        teacher: '',
        assignmentNo: '',
        assignmentFile: '',
        dueDate: ''
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role) setUserRole(user.role);
        fetchAssignments();
        getCourses();
        getTeachers();
    }, []);

    const getCourses = async () => {
        try {
            const response = await axios.get("http://localhost:3001/courses/getAllCourses", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
            });
            setCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
        }
    };

    const getTeachers = async () => {
        try {
            const response = await axios.get("http://localhost:3001/users/getAllTeachers");
            setTeachers(response.data);
        } catch (err) {
            console.error("Error fetching teachers:", err);
        }
    };

    const fetchAssignments = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return console.error("User not found in localStorage.");

        try {
            const response = await axios.get('http://localhost:3001/assignments/getAssignmentsByRole', {
                headers: { Authorization: `Bearer ${user.token}` },
                params: { role: user.role, Id: user._id }
            });
            setAssignments(response.data);
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    };

    const handleOpen = () => {
        setFormData({
            _id: '',
            title: '',
            description: '',
            course: '',
            teacher: '',
            assignmentNo: '',
            assignmentFile: '',
            dueDate: ''
        });
        setIsEditMode(false);
        setOpen(true);
    };

    const handleEdit = (assignment) => {
        const formattedDate = new Date(assignment.dueDate).toISOString().split('T')[0];
        setFormData({
            _id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            course: assignment.course._id,
            teacher: assignment.teacher._id,
            assignmentNo: assignment.assignmentNo,
            assignmentFile: '', // Clear file field during edit
            dueDate: formattedDate
        });
        setIsEditMode(true);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) form.append(key, value);
        });

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            };

            if (isEditMode) {
                await axios.put('http://localhost:3001/assignments/updateAssignmentById', form, config);
            } else {
                await axios.post('http://localhost:3001/assignments/addAssignmentByTeacher', form, config);
            }

            handleClose();
            fetchAssignments();
        } catch (error) {
            console.error('Error in form submission:', error);
        }
    };

    const handleDelete = async (id) => {
        if (userRole === 'student') return;
        if (window.confirm('Do you want to delete this assignment?')) {
            try {
                await axios.delete('http://localhost:3001/assignments/deleteAssignmentById', {
                    data: { id },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                fetchAssignments();
            } catch (err) {
                console.error("Error deleting assignment:", err);
            }
        }
    };

    return (
        <Box>
            <Modal open={open} onClose={handleClose}>
                <Box sx={style} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6">{isEditMode ? 'Edit Assignment' : 'Add Assignment'}</Typography>
                    <Stack spacing={2} mt={2}>
                        <TextField name="title" label="Title" value={formData.title} onChange={handleChange} fullWidth />
                        <TextField name="description" label="Description" value={formData.description} onChange={handleChange} fullWidth />
                        <TextField name="assignmentNo" label="Assignment No" type="number" value={formData.assignmentNo} onChange={handleChange} fullWidth />
                        <TextField name="dueDate" label="Due Date" type="date" value={formData.dueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
                        <FormControl fullWidth>
                            <InputLabel>Course</InputLabel>
                            <Select name="course" value={formData.course} onChange={handleChange} label="Course">
                                <MenuItem value="">Select a Course</MenuItem>
                                {courses.map((course) => (
                                    <MenuItem key={course._id} value={course._id}>{course.courseName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Teacher</InputLabel>
                            <Select name="teacher" value={formData.teacher} onChange={handleChange} label="Teacher">
                                <MenuItem value="">Select a Teacher</MenuItem>
                                {teachers.map((teacher) => (
                                    <MenuItem key={teacher._id} value={teacher._id}>{teacher.firstName} {teacher.lastName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="outlined" component="label">
                            {formData.assignmentFile?.name || 'Attach File'}
                            <input hidden type="file" name="assignmentFile" onChange={handleChange} />
                        </Button>
                        <Button variant="contained" type="submit">{isEditMode ? 'Update' : 'Add'}</Button>
                    </Stack>
                </Box>
            </Modal>

            {userRole !== 'student' && (
                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button onClick={handleOpen} variant="contained">Add Assignment</Button>
                </Box>
            )}

            <TableContainer component={Paper} sx={{ marginTop: 3, marginLeft: 15, minWidth: 1200 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Assignment No</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell>Teacher</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>File</TableCell>
                            {userRole !== 'student' && <TableCell>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment._id}>
                                <TableCell>{assignment.title}</TableCell>
                                <TableCell>{assignment.description}</TableCell>
                                <TableCell>{assignment.assignmentNo}</TableCell>
                                <TableCell>{assignment.course?.courseName || 'N/A'}</TableCell>
                                <TableCell>{assignment.teacher?.firstName + ' ' + assignment.teacher?.lastName || 'N/A'}</TableCell>
                                <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {assignment.assignmentFile ? (
                                        <a href={`http://localhost:3001/uploads/assignments/${assignment.assignmentFile}`} download rel="noopener noreferrer">Download File</a>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">No file</Typography>
                                    )}
                                </TableCell>
                                {userRole !== 'student' && (
                                    <TableCell>
                                        <Button variant="contained" color="info" onClick={() => handleEdit(assignment)}>Edit</Button> |
                                        <Button variant="contained" color="error" onClick={() => handleDelete(assignment._id)}>Delete</Button>
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
