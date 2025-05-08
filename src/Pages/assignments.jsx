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
    const [teachers, setTeachers] = useState([]); // State for teachers
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

    // Fetch assignments, courses, and teachers when component mounts
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role) {
            setUserRole(user.role);
        }
        fetchAssignments();
        getCourses();
        getTeachers(); // Fetch teachers
    }, []);

    // Fetch courses from the backend
    const getCourses = async () => {
        try {
            const response = await axios.get("http://localhost:3001/courses/getAllCourses");
            setCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
        }
    };
    // fetch all the courses in which teacher is tutoring


    // Fetch teachers from the backend
    const getTeachers = async () => {
        try {
            const response = await axios.get("http://localhost:3001/users/getAllTeachers");
            setTeachers(response.data);
        } catch (err) {
            console.error("Error fetching teachers:", err);
        }
    };

    // Fetch all assignments
    const fetchAssignments = async () => {
        const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
        const teacherId = user._id;
        console.log(user.role);
        console.log(teacherId);
        if (!user) {
            console.error("User not found in localStorage.");
            return;
        }

        try {
            // Pass the role as a query parameter along with the Authorization token
            const response = await axios.get('http://localhost:3001/assignments/getAssignmentsByRole', {
                headers: { Authorization: `Bearer ${user.token}` }, // Assuming token is passed for auth
                params: { role: user.role, Id: user._id }  // Pass the role as a query parameter
            });
            setAssignments(response.data);
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    };


    // Open modal for adding a new assignment
    const handleOpen = () => {
        setFormData({
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

    // Open modal for editing an existing assignment
    const handleEdit = (assignment) => {
        const formattedDate = new Date(assignment.dueDate).toISOString().split('T')[0];
        setFormData({
            _id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            course: assignment.course._id, // Assuming `course` is populated and contains _id
            teacher: assignment.teacher._id, // Assuming `teacher` is populated and contains _id
            assignmentNo: assignment.assignmentNo,
            assignmentFile: assignment.assignmentFile,
            dueDate: formattedDate
        });
        setIsEditMode(true);
        setOpen(true);
    };

    // Close the modal
    const handleClose = () => setOpen(false);

    // Handle form field change
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    // Submit form to add or update an assignment
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('title', formData.title);
        form.append('description', formData.description);
        form.append('course', formData.course);
        form.append('teacher', formData.teacher);
        form.append('assignmentNo', formData.assignmentNo);
        form.append('dueDate', formData.dueDate);
        form.append('assignmentFile', formData.assignmentFile);
        form.append('id', formData._id); // Include the ID in the form data if editing

        try {
            if (isEditMode) {
                await axios.put('http://localhost:3001/assignments/updateAssignmentById', form,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                        }
                        );

                    } else {
                    await axios.post('http://localhost:3001/assignments/addAssignmentByTeacher', form, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        } // Assuming token is passed for auth   
                    });
                }

            handleClose();
                fetchAssignments();
            } catch (error) {
                console.error('Error in form submission:', error);
            }
        };

        // Delete an assignment
        const handleDelete = async (id) => {
            if (userRole === 'student') return; // Prevent student from deleting
            if (window.confirm('Do you want to delete this assignment?')) {
                const data = { id };
                await axios.delete('http://localhost:3001/assignments/deleteAssignmentById', { data,
                
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                 });
                fetchAssignments();
            }
        };

        return (
            <Box>
                <Modal open={open} onClose={handleClose}>
                    <Box sx={style} component="form" onSubmit={handleSubmit}>
                        <Typography variant="h6">{isEditMode ? 'Edit Assignment' : 'Add Assignment'}</Typography>
                        <Stack spacing={2} mt={2}>
                            <TextField
                                name="title"
                                label="Title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                name="description"
                                label="Description"
                                type="text"
                                value={formData.description}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                name="assignmentNo"
                                label="Assignment No"
                                type="number"
                                value={formData.assignmentNo}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                name="dueDate"
                                label="Due Date"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            {/* Course Dropdown */}
                            <FormControl fullWidth>
                                <InputLabel>Course</InputLabel>
                                <Select
                                    name="course"
                                    value={formData.course || ''}
                                    onChange={handleChange}
                                    label="Course"
                                >
                                    <MenuItem value="">Select a Course</MenuItem>
                                    {courses.map((course) => (
                                        <MenuItem key={course._id} value={course._id}>
                                            {course.courseName}  {/* Display course name */}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* Teacher Dropdown */}
                            <FormControl fullWidth>
                                <InputLabel>Teacher</InputLabel>
                                <Select
                                    name="teacher"
                                    value={formData.teacher || ''}
                                    onChange={handleChange}
                                    label="Teacher"
                                >
                                    <MenuItem value="">Select a Teacher</MenuItem>
                                    {teachers.map((teacher) => (
                                        <MenuItem key={teacher._id} value={teacher._id}>
                                            {teacher.firstName} {teacher.lastName}  {/* Concatenate first and last names */}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button variant="outlined" component="label">
                                Attach File
                                <input hidden type="file" name="assignmentFile" onChange={handleChange} />
                            </Button>
                            <Button variant="contained" type="submit">
                                {isEditMode ? 'Update' : 'Add'}
                            </Button>
                        </Stack>
                    </Box>
                </Modal>

                {/* Conditionally render Add button */}
                {userRole !== 'student' && (
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button onClick={handleOpen} variant="contained">Add Assignment</Button>
                    </Box>
                )}

                <TableContainer component={Paper} sx={{ marginTop: 3, minWidth: 1200 }}>
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
                                        <a
                                            href={`http://localhost:3001/uploads/assignments/${assignment.assignmentFile}`}
                                            download
                                            rel="noopener noreferrer"
                                        >
                                            Assignment File
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {userRole !== 'student' && (
                                            <>
                                                <Button variant="contained" color="info" onClick={() => handleEdit(assignment)}>Edit</Button> |
                                                <Button variant="contained" color="error" onClick={() => handleDelete(assignment._id)}>Delete</Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    }
