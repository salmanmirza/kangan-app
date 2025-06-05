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

export default function Assignments() {
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);

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
      assignmentFile: '',
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

  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmitModalOpen(true);
  };

  const handleCloseSubmitModal = () => {
    setSelectedAssignment(null);
    setSubmissionFile(null);
    setSubmitModalOpen(false);
  };

  const handleSubmissionFileChange = (e) => {
    setSubmissionFile(e.target.files[0]);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submissionFile || !selectedAssignment) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const form = new FormData();
    form.append("assignmentId", selectedAssignment._id);
    form.append("studentId", user._id);
    form.append("file", submissionFile);
    form.append("courseId", selectedAssignment.course._id);
    form.append("textResponse", ""); // Assuming text response is optional
    form.append("comment", ""); // Assuming comment is optional

    try {
      await axios.post("http://localhost:3001/submissions/submitAssignment", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      handleCloseSubmitModal();
      alert("Assignment submitted successfully!");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Error submitting assignment.");
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
            {isEditMode ? 'Edit Assignment' : 'Add Assignment'}
          </Typography>
          <Stack spacing={2}>
            <TextField name="title" label="Title" value={formData.title} onChange={handleChange} fullWidth required />
            <TextField name="description" label="Description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} />
            <TextField name="assignmentNo" label="Assignment No" type="number" value={formData.assignmentNo} onChange={handleChange} fullWidth required inputProps={{ min: 1 }} />
            <TextField name="dueDate" label="Due Date" type="date" value={formData.dueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
            <FormControl fullWidth required>
              <InputLabel>Course</InputLabel>
              <Select name="course" value={formData.course} onChange={handleChange} label="Course">
                <MenuItem value=""><em>Select a Course</em></MenuItem>
                {courses.map(course => (
                  <MenuItem key={course._id} value={course._id}>{course.courseName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Teacher</InputLabel>
              <Select name="teacher" value={formData.teacher} onChange={handleChange} label="Teacher">
                <MenuItem value=""><em>Select a Teacher</em></MenuItem>
                {teachers.map(teacher => (
                  <MenuItem key={teacher._id} value={teacher._id}>{teacher.firstName} {teacher.lastName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" component="label" fullWidth>
              {formData.assignmentFile?.name || 'Attach File'}
              <input hidden type="file" name="assignmentFile" onChange={handleChange} />
            </Button>
            <Button variant="contained" type="submit" fullWidth size="large" sx={{ fontWeight: 'bold' }}>
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {userRole !== 'student' && (
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button onClick={handleOpen} variant="contained" size="large" sx={{ fontWeight: 'bold' }}>
            Add Assignment
          </Button>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxWidth: '1200px', margin: 'auto', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>Assignment No</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>Course</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>Teacher</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>Due Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>File</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '600' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map(assignment => (
              <TableRow key={assignment._id}>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>{assignment.description}</TableCell>
                <TableCell>{assignment.assignmentNo}</TableCell>
                <TableCell>{assignment.course?.courseName || 'N/A'}</TableCell>
                <TableCell>{assignment.teacher ? `${assignment.teacher.firstName} ${assignment.teacher.lastName}` : 'N/A'}</TableCell>
                <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {assignment.assignmentFile ? (
                    <a href={`http://localhost:3001/uploads/assignments/${assignment.assignmentFile}`} download rel="noopener noreferrer">
                      Download File
                    </a>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No file</Typography>
                  )}
                </TableCell>
                {userRole !== 'student' && (
                  <TableCell>
                    <Button variant="contained" color="info" size="small" onClick={() => handleEdit(assignment)} sx={{ mr: 1 }}>
                      Edit
                    </Button>
                    <Button variant="contained" color="error" size="small" onClick={() => handleDelete(assignment._id)}>
                      Delete
                    </Button>
                  </TableCell>
                )}
                {userRole === 'student' && (
                  <TableCell>
                    <Button variant="contained" color="primary" size="small" onClick={() => handleOpenSubmitModal(assignment)}>
                      Submit
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={submitModalOpen} onClose={handleCloseSubmitModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleSubmitAssignment}>
          <Typography variant="h6" mb={3} fontWeight="bold">
            Submit Assignment: {selectedAssignment?.title}
          </Typography>
          <Stack spacing={2}>
            <Button variant="outlined" component="label" fullWidth>
              {submissionFile?.name || 'Choose File to Upload'}
              <input hidden type="file" onChange={handleSubmissionFileChange} />
            </Button>
            <Button variant="contained" type="submit" fullWidth size="large" sx={{ fontWeight: 'bold' }}>
              Submit
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box className="joyride-assignments">
        {/* Assignment List/Link */}
      </Box>

    </Box>
  );
}
