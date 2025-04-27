
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
    const [formData, setFormData] = useState({
        _id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        department: '',
        qualification: '',
        studentRollNo: '',
        studentGuardian: '',
        role: '',
    });

    useEffect(() => {
        getUsers();
    }, []);

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
            department: '',
            qualification: '',
            studentRollNo: '',
            studentGuardian: '',
            role: '',
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
            department: row.department || '',
            qualification: row.qualification || '',
            studentRollNo: row.studentRollNo || '',
            studentGuardian: row.studentGuardian || '',
            role: row.role || ''
        });
        setIsEditMode(true);
        setOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditMode) {
            await axios.put("http://localhost:3001/users/updateUserByIdByAdmin", formData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
        } else {
            await axios.post("http://localhost:3001/users/addNewUserByAdmin", formData);
        }
        handleClose();
        getUsers();
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
                        <Stack direction="row" spacing={2}>
                            <TextField name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} />
                            <TextField name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} />
                            <TextField name="email" label="Email" value={formData.email} onChange={handleChange} />
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <FormControl sx={{ width: '52ch' }}>
                                <InputLabel>Role</InputLabel>
                                <Select name="role" value={formData.role} label="Role" onChange={handleChange}>
                                    <MenuItem value="teacher">Teacher</MenuItem>
                                    <MenuItem value="student">Student</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField name="password" label="Password" value={formData.password} onChange={handleChange} />
                        </Stack>
                        {formData.role === 'teacher' && (
                            <Stack direction="row" spacing={2}>
                                <TextField name="department" label="department" value={formData.department} onChange={handleChange} />
                                <TextField name="qualification" label="qualification" value={formData.qualification} onChange={handleChange} />
                            </Stack>
                        )}
                        {formData.role === 'student' && (
                            <Stack direction="row" spacing={2}>
                                <TextField name="studentRollNo" label="Roll No" value={formData.studentRollNo} onChange={handleChange} />
                                <TextField name="studentGuardian" label="Guardian" value={formData.studentGuardian} onChange={handleChange} />
                            </Stack>
                        )}
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" type="submit">
                                {isEditMode ? 'Update' : 'Add'}
                            </Button>
                        </Stack>
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
                                <TableCell>Department</TableCell>
                                <TableCell>Qualification</TableCell>
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
                                    <TableCell>{row.department}</TableCell>
                                    <TableCell>{row.qualification}</TableCell>
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
                                <TableCell>Roll No</TableCell>
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
                                    <TableCell>{row.studentRollNo}</TableCell>
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
