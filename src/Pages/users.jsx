import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Modal, Typography, Stack, TextField,
    FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
    TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import PropTypes from 'prop-types';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 4,
    p: 4,
};

const Users = () => {
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [value, setValue] = useState(0);
    const [fetchedUsers, setFectchedUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        _id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        studentRollNo: '',
        studentGuardian: '',
        role: '',
        course: '',
    });

    useEffect(() => {
        getUsers();
        getCourses();
    }, []);

    const getCourses = async () => {
        try {
            const response = await axios.get("http://localhost:3001/courses/getAllCourses");
            setCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
        }
    };

    const getUsers = async () => {
        const response = await axios.get("http://localhost:3001/users/admin", {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
        });
        setFectchedUsers(response.data);
    };

    const handleTabChange = (event, newValue) => setValue(newValue);
    const handleClose = () => setOpen(false);

    const handleAddNewUser = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            studentRollNo: '',
            studentGuardian: '',
            role: '',
            courses: [],
        });
        setIsEditMode(false);
        setOpen(true);
    };

    const handleEditAndUpdate = (row) => {
        setFormData({
            _id: row._id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            studentRollNo: row.studentRollNo || '',
            studentGuardian: row.studentGuardian || '',
            role: row.role || '',
            course: row.course ? row.course._id : ''
        });
        setIsEditMode(true);
        setOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'courses') {
            setFormData((prev) => ({
                ...prev,
                courses: typeof value === 'string' ? value.split(',') : value,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure the teacher selects a course
        if (formData.role === 'teacher' && !formData.course) {
            alert("Please select a course for the teacher.");
            return;
        }

        try {
            if (isEditMode) {
                // Update existing user
                await axios.put("http://localhost:3001/users/updateUserByIdByAdmin", formData, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
            } else {
                // Add new user
                await axios.post("http://localhost:3001/users/addNewUserByAdmin", formData);
            }

            handleClose();
            getUsers();  // Reload the user list
        } catch (err) {
            console.error("Error submitting form:", err);
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm("Do you want to delete the Record?")) {
            await axios.delete("http://localhost:3001/users/deleteById", {
                data: { _id: id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
            });
            getUsers();
        }
    };

    const teachers = fetchedUsers.filter(user => user.role === 'teacher');
    const students = fetchedUsers.filter(user => user.role === 'student');

    function CustomTabPanel(props) {
        const { children, value, index, ...other } = props;
        return (
            <div hidden={value !== index} {...other}>
                {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
            </div>
        );
    }

    CustomTabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `tabpanel-${index}`,
        };
    }

    return (
        <Box>
            <Modal open={open} onClose={handleClose}>
                <Box sx={style} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6">{isEditMode ? 'Edit User' : 'Add User'}</Typography>
                    <Stack spacing={2} mt={2}>
                        <TextField
                            name="firstName"
                            label="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            name="lastName"
                            label="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            name="email"
                            label="Email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            name="password"
                            label="Password"
                            value={formData.password}
                            onChange={handleChange}
                            type="password"
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                label="Role"
                            >
                                <MenuItem value="teacher">Teacher</MenuItem>
                                <MenuItem value="student">Student</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Show Course Dropdown only if Teacher role is selected */}
                        {formData.role === 'teacher' && (
                            <FormControl fullWidth>
                                <InputLabel>Course</InputLabel>
                                <Select
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    label="Course"
                                >
                                    {courses.map((course) => (
                                        <MenuItem key={course._id} value={course._id}>
                                            {course.courseName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Show Courses Dropdown only if Student role is selected */}
                        {formData.role === 'student' && (
                            <>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        name="studentRollNo"
                                        label="Roll No"
                                        value={formData.studentRollNo}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                    <TextField
                                        name="studentGuardian"
                                        label="Guardian"
                                        value={formData.studentGuardian}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                </Stack>

                                <FormControl fullWidth>
                                    <InputLabel>Courses</InputLabel>
                                    <Select
                                        name="courses"
                                        multiple
                                        value={formData.courses || []}  // Ensure this is an array
                                        onChange={handleChange}
                                        label="Courses"
                                    >
                                        {courses.map((course) => (
                                            <MenuItem key={course._id} value={course._id}>
                                                {course.courseName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}



                        <Button variant="contained" type="submit" fullWidth>
                            {isEditMode ? 'Update' : 'Add'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button onClick={handleAddNewUser} variant="contained">Add User</Button>
            </Box>

            <TableContainer component={Paper} sx={{ marginTop: 3, minWidth: 1100 }}>
                <Tabs value={value} onChange={handleTabChange}>
                    <Tab label="Teachers" {...a11yProps(0)} />
                    <Tab label="Students" {...a11yProps(1)} />
                </Tabs>

                <CustomTabPanel value={value} index={0}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teachers.map((row) => (
                                <TableRow key={row._id}>
                                    <TableCell>{row.firstName}</TableCell>
                                    <TableCell>{row.lastName}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.role}</TableCell>
                                    <TableCell>{row.course ? row.course.courseName : 'No course assigned'}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="info" onClick={() => handleEditAndUpdate(row)}>Edit</Button> |
                                        <Button variant="contained" color="error" onClick={() => handleDelete(row._id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={1}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((row) => (
                                <TableRow key={row._id}>
                                    <TableCell>{row.firstName}</TableCell>
                                    <TableCell>{row.lastName}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.role}</TableCell>
                                    <TableCell>
                                        {row.courses && row.courses.length > 0
                                            ? row.courses.map(course => course.courseName).join(', ')  // Iterate and join course names for students
                                            : 'No course assigned'}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="info" onClick={() => handleEditAndUpdate(row)}>Edit</Button> |
                                        <Button variant="contained" color="error" onClick={() => handleDelete(row._id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </CustomTabPanel>
            </TableContainer>
        </Box>
    );
};

export default Users;
