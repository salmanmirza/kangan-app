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

export default function AssignmentPage() {
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [formData, setFormData] = useState({
        _id: '',
        assignmentNo: '',
        assignmentFile: '',
        dueDate: ''
    });

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        const response = await axios.get('http://localhost:3001/assignments/getAllAssignments');
        setAssignments(response.data);
    };

    const handleOpen = () => {
        setFormData({ assignmentNo: '', assignmentFile: '', dueDate: '' });
        setIsEditMode(false);
        setOpen(true);
    };

    const handleEdit = (assignment) => {
        const formattedDate = new Date(assignment.dueDate).toISOString().split('T')[0];
        setFormData({
            _id: assignment._id,
            assignmentNo: assignment.assignmentNo,
            assignmentFile: assignment.assignmentFile,
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
        form.append('assignmentNo', formData.assignmentNo);
        form.append('assignmentFile', formData.assignmentFile);
        form.append('dueDate', formData.dueDate);
        form.append('id', formData._id); // Include the ID in the form data if editing

        try {
            if (isEditMode) {
                await axios.put('http://localhost:3001/assignments/updateAssignmentById', form);
            } else {
                await axios.post('http://localhost:3001/assignments/addAssignmentByTeacher', form);
            }

            handleClose();
            fetchAssignments();
        } catch (error) {
            console.error('Error in form submission:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Do you want to delete this assignment?')) {
            const data = { id };
            const url = 'http://localhost:3001/assignments/deleteAssignmentById';
            await axios.delete(url, { data });
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

            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button onClick={handleOpen} variant="contained">Add Assignment</Button>
            </Box>

            <TableContainer component={Paper} sx={{ marginTop: 3, minWidth: 1100 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Assignment No</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>File</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment._id}>
                                <TableCell>{assignment.assignmentNo}</TableCell>
                                <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <a href={`http://localhost:3001/uploads/${assignment.assignmentFile}`} target="_blank" rel="noopener noreferrer">
                                        {assignment.assignmentFile}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <Button variant="contained" color="info" onClick={() => handleEdit(assignment)}>Edit</Button> |
                                    <Button variant="contained" color="error" onClick={() => handleDelete(assignment._id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
