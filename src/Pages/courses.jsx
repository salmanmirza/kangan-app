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
    Box, Button, Modal, Typography, Stack, TextField, CircularProgress,
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
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [userFormData, setUserFormData] = useState({
        _id: '',
        courseName: '',
        description: '',
        imgPath: null,
    });
    const [loading, setLoading] = useState(false);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

    useEffect(() => {
        console.log('User:', user);
        getCourses();
    }, []);

    const getCourses = async () => {
        setIsLoadingCourses(true);
        try {
            const token = localStorage.getItem('token');
            const userId = user._id;

            const response = await axios.get(
                `http://localhost:3001/courses/getCoursesByRole?_id=${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            console.log('Courses fetched:', response.data);
            setCourses(response.data || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setCourses([]);
        } finally {
            setIsLoadingCourses(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setUserFormData({
            _id: '',
            courseName: '',
            description: '',
            imgPath: null,
        });
    };

    const handleAddNewCourse = () => {
        setUserFormData({
            courseName: '',
            description: '',
            imgPath: null,
        });
        setIsEditMode(false);
        setOpen(true);
    };

    const handleEditAndUpdate = (row) => {
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
        if (userFormData.imgPath) {
            formData.append('imgPath', userFormData.imgPath);
        }

        try {
            setLoading(true);
            if (isEditMode) {
                formData.append('_id', userFormData._id);
                await axios.put("http://localhost:3001/courses/updateCourseByIdByAdmin", formData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        'Content-Type': 'multipart/form-data',
                    }
                });
            } else {
                formData.append('teacherId', user._id);
                await axios.post("http://localhost:3001/courses/addNewCourseByAdmin", formData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        'Content-Type': 'multipart/form-data',
                    }
                });
            }
            getCourses();
            handleClose();
        } catch (err) {
            console.error('Error submitting course:', err);
        } finally {
            setLoading(false);
        }
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
            <NavBar />
            <Box sx={{ p: 3 }}>
                {/* Add Course Button (Admin Only) */}
                {user?.role === 'admin' && (
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button onClick={handleAddNewCourse} variant="contained">
                            Add Course
                        </Button>
                    </Box>
                )}

                {/* Courses Display */}
                {isLoadingCourses ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box mt={4} display="flex" flexWrap="wrap" gap={3}>
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <Box key={course._id} sx={{ position: 'relative', width: 300 }}>
                                    <Card sx={{ width: 300 }}>
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
                                                <Typography variant="body2" color="text.secondary">
                                                    {course.description}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="h6" sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
                                No courses available for your role
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Edit/Add Course Modal */}
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
                                required
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
                                required
                            />

                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    {userFormData.imgPath && typeof userFormData.imgPath !== 'string'
                                        ? 'Change Image'
                                        : 'Upload Image'}
                                    <VisuallyHiddenInput
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                </Button>

                                {(userFormData.imgPath) && (
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

                            <Button
                                variant="contained"
                                type="submit"
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update Course' : 'Add Course'}
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
            </Box>
        </>
    );
}