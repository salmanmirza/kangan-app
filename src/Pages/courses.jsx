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
    FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
    TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody
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
    const [fetchedUsers, setFectchedUsers] = useState([]);
    const [formData, setFormData] = useState({
        _id: '', courseName: '',
        courseCode: '',
        description: '',
        imgPath: '',
    });

    useEffect(() => {
        // getUsers();
    }, []);

    // const getUsers = async () => {
    //     const response = await axios.get("http://localhost:3001/users/admin", {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: `Bearer ${localStorage.getItem("token")}`
    //         },
    //     });
    //     setFectchedUsers(response.data);
    // };

    const handleClose = () => setOpen(false);

    const handleAddNewCourse = () => {
        setFormData({
            courseName: '',
            courseCode: '',
            description: '',
            imgPath: '',
        });
        setIsEditMode(false);
        setOpen(true);
    };

    const handleEditAndUpdate = (row) => {
        setFormData({
            _id: row._id,
            courseName: '',
            courseCode: '',
            description: '',
            imgPath: '',
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
            // await axios.put("http://localhost:3001/users/updateUserByIdByAdmin", formData, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         Authorization: `Bearer ${localStorage.getItem("token")}`
            //     }
            // });
        } else {
            // await axios.post("http://localhost:3001/users/addNewUserByAdmin", formData);
        }
        handleClose();
        getUsers();
    };

    const handleDelete = async (id) => {
        // if (window.confirm("Do you want to delete the Record?")) {
        //     await axios.delete("http://localhost:3001/users/deleteById", {
        //         data: { _id: id },
        //         headers: {
        //             'Content-Type': 'application/json',
        //             Authorization: `Bearer ${localStorage.getItem("token")}`
        //         },
        //     });
        //     getUsers();
        // }
    };






    return (
        <>
            {/* modal code--start */}
            <Box>
                <Modal open={open} onClose={handleClose}>
                    <Box sx={style} component="form" onSubmit={handleSubmit}>
                        <Typography variant="h6">{isEditMode ? 'Edit Course' : 'Add Course'}</Typography>
                        <Stack spacing={2} mt={2}>
                            <Stack direction="row" spacing={2}>
                                <TextField name="courseName" fullWidth label="Course Name" value={formData.courseName} onChange={handleChange} />
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <TextareaAutosize
                                    fullWidth
                                    aria-label="course description"
                                    minRows={6}
                                    placeholder="Enter Course Description Max. 150 words"
                                    style={{ width: 800, padding: 8 }}
                                    value={formData.email}
                                    onChange={handleChange}
                                />                                </Stack>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    component="label"
                                    role={undefined}
                                    variant="contained"
                                    tabIndex={-1}
                                    startIcon={<CloudUploadIcon />}
                                     fullWidth
                                >
                                    Upload files
                                    <VisuallyHiddenInput
                                        type="file"
                                        onChange={(event) => console.log(event.target.files)}
                                        multiple
                                    />
                                </Button>
                            </Stack>
                            <Button type="submit" variant="contained">{isEditMode ? 'Update' : 'Add'}</Button>
                        </Stack>
                    </Box>
                </Modal>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button onClick={handleAddNewCourse} variant="contained">Add Course</Button>
                </Box>

                <TableContainer component={Paper} sx={{ marginTop: 3, minWidth: 1100 }}>

                </TableContainer>
            </Box>
            {/* modal code --end */}
            <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                    <CardMedia
                        component="img"
                        height="140"
                        image="/static/images/cards/contemplative-reptile.jpg"
                        alt="green iguana"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Lizard
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Lizards are a widespread group of squamate reptiles, with over 6,000
                            species, ranging across all continents except Antarctica
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>


        </>

    );
}