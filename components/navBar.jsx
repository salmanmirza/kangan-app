import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
    AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, Avatar,
    Modal, Stack, TextField, Button
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';

const drawerWidth = 240;

export default function NavBar() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openModal, setOpenModal] = React.useState(false);
    const [formData, setFormData] = React.useState({
        _id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const role = JSON.parse(localStorage.getItem('role')); // Get role from localStorage
    const userName = user?.firstName || 'User';
    const userId = user?._id;

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleOpenModal = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/users/getUserToUpdateById?userId=${userId}`);
            setFormData({
                _id: res.data._id,
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || '',
                email: res.data.email || '',
                password: '' // Don't pre-fill password for security
            });
            setOpenModal(true);
        } catch (err) {
            console.error('Error fetching user data', err);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3001/users/editUpdateUserById?userId=${userId}`, formData);

            // ✅ Preserve the user's role in localStorage
            localStorage.setItem('user', JSON.stringify({
                _id: formData._id,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: user.role // include the original role
            }));

            setOpenModal(false);
            window.location.reload();
        } catch (err) {
            console.error('Update failed', err);
        }
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };

    return (
        <>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h5">Kangan</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography sx={{ mr: 2 }}>Welcome, {userName}</Typography>
                    <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 1 }}>
                        <Avatar>{userName.charAt(0)}</Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        onClick={handleClose}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    >
                        <MenuItem onClick={handleOpenModal}>Update Profile</MenuItem>
                        <MenuItem onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                        }}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Drawer
                sx={{ width: "140px", flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar />
                <Divider />
                <List>
                    {/* Always visible */}
                    <ListItem>
                        <ListItemButton component={NavLink} to="/dashboard">
                            <ListItemIcon><PeopleIcon /></ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem>
                        <ListItemButton component={NavLink} to="/dashboard/courses">
                            <ListItemIcon><PeopleIcon /></ListItemIcon>
                            <ListItemText primary="Courses" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem>
                        <ListItemButton component={NavLink} to="/dashboard/assignments">
                            <ListItemIcon><PeopleIcon /></ListItemIcon>
                            <ListItemText primary="Assignments" />
                        </ListItemButton>
                    </ListItem>

                    {/* Only Admin can see Users and Enrollments */}
                    {role === 'admin' && (
                        <>
                            <ListItem>
                                <ListItemButton component={NavLink} to="/dashboard/users">
                                    <ListItemIcon><PeopleIcon /></ListItemIcon>
                                    <ListItemText primary="Users" />
                                </ListItemButton>
                            </ListItem>

                            <ListItem>
                                <ListItemButton component={NavLink} to="/dashboard/enrollments">
                                    <ListItemIcon><PeopleIcon /></ListItemIcon>
                                    <ListItemText primary="Enrollments" />
                                </ListItemButton>
                            </ListItem>
                        </>
                    )}
                </List>
            </Drawer>

            {/* Profile Update Modal */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6">Edit Profile</Typography>
                    <Stack spacing={2} mt={2}>
                        <TextField name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} fullWidth />
                        <TextField name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} fullWidth />
                        <TextField name="email" label="Email" value={formData.email} onChange={handleChange} fullWidth />
                        <TextField name="password" label="Password" type="password" value={formData.password} onChange={handleChange} fullWidth />
                        <Button type="submit" variant="contained">Update</Button>
                    </Stack>
                </Box>
            </Modal>
        </>
    );
}
