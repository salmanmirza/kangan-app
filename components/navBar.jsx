import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
    AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, Avatar,
    Modal, Stack, TextField, Button, Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';

const drawerWidth = 240;

export default function NavBar() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openModal, setOpenModal] = React.useState(false);
    const [formData, setFormData] = React.useState({
        _id: '', firstName: '', lastName: '', email: '', password: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const role = localStorage.getItem('role'); // fix here
    
    const userName = user?.firstName || 'User';
    const userId = user?._id

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
                password: ''
            });
            setOpenModal(true);
        } catch (err) {
            console.error('Error fetching user data', err);
        }
    };

    const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3001/users/editUpdateUserById?userId=${userId}`, formData);
            localStorage.setItem('user', JSON.stringify({
                _id: formData._id,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: user.role
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

    const navItems = [
        { to: "/dashboard", icon: <DashboardIcon color="primary" />, label: "Dashboard" },
        { to: "/dashboard/courses", icon: <SchoolIcon color="secondary" />, label: "Courses" },
        { to: "/dashboard/assignments", icon: <AssignmentIcon color="success" />, label: "Assignments" },
        ...(role === 'admin' ? [
            { to: "/dashboard/users", icon: <GroupIcon color="warning" />, label: "Users" },
            { to: "/dashboard/enrollments", icon: <HowToRegIcon color="error" />, label: "Enrollments" }
        ] : [])
    ];

    return (
        <>
            <CssBaseline />
            <AppBar position="fixed" sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                background: 'linear-gradient(to right, #3f51b5, #2196f3)',
            }}>
                <Toolbar>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>Kangan</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography sx={{ mr: 2, color: 'white' }}>Welcome, {userName}</Typography>
                    <Tooltip title="Profile">
                        <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 1 }}>
                            <Avatar sx={{ bgcolor: "#fff", color: "#3f51b5", fontWeight: 'bold' }}>
                                {userName.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
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
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#f5f5f5'
                    }
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar />
                <Divider />
                <List>
                    {navItems.map(({ to, icon, label }) => (
                        <ListItem key={label} disablePadding>
                            <ListItemButton component={NavLink} to={to} sx={{
                                '&:hover': {
                                    backgroundColor: '#e0f7fa',
                                    transform: 'scale(1.01)',
                                    transition: '0.2s ease-in-out'
                                }
                            }}>
                                <ListItemIcon>{icon}</ListItemIcon>
                                <ListItemText primary={label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6" fontWeight="bold">Edit Profile</Typography>
                    <Stack spacing={2} mt={2}>
                        <TextField name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} fullWidth />
                        <TextField name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} fullWidth />
                        <TextField name="email" label="Email" value={formData.email} onChange={handleChange} fullWidth />
                        <TextField name="password" label="Password" type="password" value={formData.password} onChange={handleChange} fullWidth />
                        <Button type="submit" variant="contained" color="primary">Update</Button>
                    </Stack>
                </Box>
            </Modal>
        </>
    );
}
