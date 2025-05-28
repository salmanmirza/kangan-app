import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavBar from '../../components/navBar';
import {
  Box, Button, Modal, Typography, Stack,
  TextField, CircularProgress, Card, CardContent, CardMedia, CardActionArea
} from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import axios from 'axios';

// Hidden input for file upload
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

// Modal style
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: '#f5f7fa', // light background consistent with page
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

// Styled course card
const StyledCard = styled(Card)(({ theme }) => ({
  width: 300,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  backgroundColor: '#fff', // keep card white for contrast
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const Courses = () => {
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
    getCourses();
  }, []);

  const getCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const token = localStorage.getItem('token');
      const userId = user._id;
      const response = await axios.get(
        `http://localhost:3001/courses/getCoursesByRole?_id=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(response.data || []);
      localStorage.setItem('totalCountCourses', response.data.length);
      localStorage.setItem('courses', JSON.stringify(response.data));
    } catch (err) {
      console.error(err);
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
    if (userFormData.imgPath) formData.append('imgPath', userFormData.imgPath);

    try {
      setLoading(true);
      if (isEditMode) {
        formData.append('_id', userFormData._id);
        await axios.put("http://localhost:3001/courses/updateCourseByIdByAdmin", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        formData.append('teacherId', user._id);
        await axios.post("http://localhost:3001/courses/addNewCourseByAdmin", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      getCourses();
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete the Record?")) {
      await axios.delete("http://localhost:3001/courses/deleteCourseByIdByAdmin", {
        data: { _id: id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
      });
      getCourses();
    }
  };

  return (
    <>
      <NavBar />
      {/* Full page background */}
      <Box
        sx={{
          bgcolor: '#f5f7fa', // consistent soft light blue-gray background
          minHeight: '100vh',
          py: 4,
          px: 2,
        }}
      >
        {user?.role === 'admin' && (
          <Box display="flex" justifyContent="flex-end" mb={3} px={1}>
            <Button
              onClick={handleAddNewCourse}
              variant="contained"
              color="primary"
              sx={{
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0,0,0,0.25)',
                },
              }}
            >
              Add Course
            </Button>
          </Box>
        )}

        {isLoadingCourses ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress size={40} thickness={5} />
          </Box>
        ) : (
          <Box
            mt={4}
            display="flex"
            flexWrap="wrap"
            gap={4}
            justifyContent="center"
          >
            {courses.length > 0 ? (
              courses.map((course) => (
                <Box key={course._id} sx={{ position: 'relative' }}>
                  <StyledCard>
                    <CardActionArea>
                      {course.imgPath && (
                        <CardMedia
                          component="img"
                          height="160"
                          image={`http://localhost:3001${course.imgPath}`}
                          alt={course.courseName}
                          sx={{
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                          }}
                        />
                      )}
                      <CardContent sx={{ minHeight: 140 }}>
                        <Typography
                          gutterBottom
                          variant="h6"
                          component="div"
                          sx={{ fontWeight: 600, color: '#1a237e' }}
                        >
                          {course.courseName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: 14,
                            lineHeight: 1.5,
                            minHeight: 70,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {course.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>

                    {user?.role === 'admin' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          padding: 1,
                          borderRadius: 2,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEditAndUpdate(course)}
                          sx={{ textTransform: 'none', fontWeight: 'medium' }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(course._id)}
                          sx={{ textTransform: 'none', fontWeight: 'medium' }}
                        >
                          Delete
                        </Button>
                      </Box>
                    )}
                  </StyledCard>
                </Box>
              ))
            ) : (
              <Typography
                variant="h6"
                sx={{ width: '100%', textAlign: 'center', mt: 4, color: '#555' }}
              >
                No courses available for your role
              </Typography>
            )}
          </Box>
        )}

        {/* Edit/Add Course Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box sx={style} component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h5"
              fontWeight="bold"
              mb={3}
              color="#1a237e"
            >
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
                variant="outlined"
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
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: 16,
                  borderColor: '#bbb',
                  borderRadius: 6,
                  resize: 'vertical',
                  boxShadow: 'inset 0 1px 3px rgb(0 0 0 / 0.1)',
                }}
                required
              />

              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    bgcolor: '#1a237e',
                    '&:hover': {
                      bgcolor: '#283593',
                    },
                  }}
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
                sx={{
                  mt: 2,
                  fontWeight: 'bold',
                  bgcolor: '#1a237e',
                  '&:hover': {
                    bgcolor: '#283593',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : isEditMode ? 'Update Course' : 'Add Course'}
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default Courses;
