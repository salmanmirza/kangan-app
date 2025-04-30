import PropTypes from 'prop-types'; 
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavBar from '../../components/navBar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Modal, Typography, Stack, TextField,
    TableContainer, Paper
} from '@mui/material';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

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

export default function Courses() {
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [courses, setCourses] = useState([]);
    const [userFormData, setUserFormData] = useState({
        _id: '',
        courseName: '',
        description: '',
        imgPath: null,
    });

    useEffect(() => {
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

    const handleClose = () => setOpen(false);

    const handleAddNewCourse = () => {
        setUserFormData({
            courseName: '',
            description: '',
            imgPath: null,
        });
        setIsEditMode(false);
        setOpen(true);
    };

    const handleEditAndUpdate = async (row) => {
        setUserFormData({
            _id: row._id,
            courseName: row.courseName,
            description: row.description,
            imgPath: row.imgPath,
        });
        setIsEditMode(true);
        setOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setUserFormData((prev) => ({ ...prev, imgPath: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('courseName', userFormData.courseName);
        formData.append('description', userFormData.description);
        formData.append('_id', userFormData._id); // Send the course ID to update
        if (userFormData.imgPath) {
            formData.append('imgPath', userFormData.imgPath);
        }

        if (isEditMode) {
            await axios.put("http://localhost:3001/courses/updateCourseByIdByAdmin", formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
        } else {
            await axios.post("http://localhost:3001/courses/addNewCourseByAdmin", formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
        }
        handleClose();
        getCourses();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Do you want to delete the Record?")) {
            await axios.delete("http://localhost:3001/courses/deleteCourseByIdByAdmin", {
                data: { _id: id },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'Content-Type': 'application/json',
                }
            });
            getCourses();
        }
    };

    return (
        <>
            {/* Modal code */}
            <Box>
                <Modal open={open} onClose={handleClose}>
                    <Box sx={style} component="form" onSubmit={handleSubmit}>
                        <Typography variant="h6" mb={2}>
                            {isEditMode ? 'Edit Course' : 'Add Course'}
                        </Typography>

                        <Stack spacing={3}>
                            <TextField
                                label="Course Name"
                                name="courseName"
                                value={userFormData.courseName}
                                onChange={handleChange}
                                fullWidth
                            />

                            <TextareaAutosize
                                minRows={6}
                                name="description"
                                placeholder="Enter Course Description Max. 150 words"
                                value={userFormData.description}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    fontFamily: 'inherit',
                                    borderColor: '#ccc',
                                    borderRadius: 4
                                }}
                            />

                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    {userFormData.imgPath && typeof userFormData.imgPath !== 'string'
                                        ? 'Change Doc'
                                        : 'Upload Doc'}
                                    <VisuallyHiddenInput type="file" onChange={handleFileChange} />
                                </Button>

                                {(isEditMode && userFormData.imgPath) && (
                                    <Box
                                        sx={{
                                            width: 160,
                                            height: 120,
                                            border: '1px solid #ddd',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            backgroundColor: '#f5f5f5',
                                        }}
                                    >
                                        <img
                                            src={typeof userFormData.imgPath === 'string'
                                                ? `http://localhost:3001${userFormData.imgPath}`
                                                : URL.createObjectURL(userFormData.imgPath)}
                                            alt="Course Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                )}
                            </Stack>

                            <Button variant="contained" type="submit">
                                {isEditMode ? 'Update Course' : 'Add Course'}
                            </Button>
                        </Stack>
                    </Box>
                </Modal>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button onClick={handleAddNewCourse} variant="contained">Add Course</Button>
                </Box>

                <TableContainer component={Paper} sx={{ marginTop: 3, minWidth: 1100 }} />
            </Box>

            {/* Card displaying all courses */}
            <Box mt={4} display="flex" flexWrap="wrap" gap={3}>
                {courses.map((course) => (
                    <Box
                        key={course._id}
                        sx={{
                            position: 'relative',
                            '&:hover .action-buttons': {
                                opacity: 1,
                            },
                        }}
                    >
                        <Card sx={{ width: 300, position: 'relative' }}>
                            <CardActionArea>
                                {course.imgPath && (
                                    <CardMedia
                                        component="img"
                                        height="160"
                                        image={`http://localhost:3001${course.imgPath}`}
                                        alt={course.courseName}
                                    />
                                )}
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {course.courseName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {course.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>

                            <Box
                                className="action-buttons"
                                sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: 1,
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease-in-out',
                                    zIndex: 10,
                                }}
                            >
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleEditAndUpdate(course)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleDelete(course._id)}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Card>
                    </Box>
                ))}
            </Box>
        </>
    );
}
