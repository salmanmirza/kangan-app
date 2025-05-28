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
  width: '90vw',
  maxWidth: 800,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  boxSizing: 'border-box',
};

const Users = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [value, setValue] = useState(0);
  const [fetchedUsers, setFetchedUsers] = useState([]);
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
    courses: [],
  });

  useEffect(() => {
    getUsers();
    getCourses();
  }, []);

  const getCourses = async () => {
    try {
      const response = await axios.get("http://localhost:3001/courses/getAllCourses", {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
      });
      setCourses(response.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/users/admin", {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
      });
      setFetchedUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleTabChange = (event, newValue) => setValue(newValue);
  const handleClose = () => setOpen(false);

  const handleAddNewUser = () => {
    setFormData({
      _id: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      studentRollNo: '',
      studentGuardian: '',
      role: '',
      course: '',
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
      password: '',
      studentRollNo: row.studentRollNo || '',
      studentGuardian: row.studentGuardian || '',
      role: row.role || '',
      course: row.course ? row.course._id : '',
      courses: row.courses ? row.courses.map(c => c._id) : [],
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

    if (formData.role === 'teacher' && !formData.course) {
      alert("Please select a course for the teacher.");
      return;
    }

    try {
      if (isEditMode) {
        await axios.put("http://localhost:3001/users/updateUserByIdByAdmin", formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
      } else {
        await axios.post("http://localhost:3001/users/addNewUserByAdmin", formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
      }

      handleClose();
      getUsers();
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete the Record?")) {
      try {
        await axios.delete("http://localhost:3001/users/deleteById", {
          data: { _id: id },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
        });
        getUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  const teachers = fetchedUsers.filter(user => user.role === 'teacher');
  const students = fetchedUsers.filter(user => user.role === 'student');

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div hidden={value !== index} {...other}>
        {value === index && <Box sx={{ p: 3, px: 0 }}>{children}</Box>}
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
    <Box sx={{ pt: '80px', px: 3, boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
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
              required
            />
            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              type="email"
            />
            <TextField
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              fullWidth
              {...(isEditMode ? {} : { required: true })}
              helperText={isEditMode ? 'Leave blank to keep current password' : ''}
            />
            <FormControl fullWidth required>
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

            {formData.role === 'teacher' && (
              <FormControl fullWidth required>
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
                    value={formData.courses || []}
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

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button onClick={handleAddNewUser} variant="contained">Add User</Button>
      </Box>

      <Tabs value={value} onChange={handleTabChange}>
        <Tab label="Teachers" {...a11yProps(0)} />
        <Tab label="Students" {...a11yProps(1)} />
      </Tabs>

      <CustomTabPanel value={value} index={0}>
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ width: '100%', minWidth: 900 }} size="medium">
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
                    <Button variant="contained" color="info" size="small" onClick={() => handleEditAndUpdate(row)} sx={{ mr: 1 }}>
                      Edit
                    </Button>
                    <Button variant="contained" color="error" size="small" onClick={() => handleDelete(row._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ width: '100%', minWidth: 900 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Courses</TableCell>
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
                      ? row.courses.map(course => course.courseName).join(', ')
                      : 'No course assigned'}
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" color="info" size="small" onClick={() => handleEditAndUpdate(row)} sx={{ mr: 1 }}>
                      Edit
                    </Button>
                    <Button variant="contained" color="error" size="small" onClick={() => handleDelete(row._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CustomTabPanel>
    </Box>
  );
};

export default Users;
