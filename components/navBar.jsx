import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, Outlet } from 'react-router-dom'

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { BadgeOutlined, SchoolOutlined } from '@mui/icons-material';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import PeopleIcon from '@mui/icons-material/People';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const drawerWidth = 240;

export default function NavBar(){
    return (
        <Drawer
            sx={{
                width: '150px',
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Toolbar>
                <AppBar
                    position="fixed"
                >
                    <Toolbar>
                        <Typography variant="h4" component="div">
                            Kangan
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Toolbar>

            <Divider />
            {/* 
        <List>
          {['Dashboard', 'Courses', 'Users', 'Assignments'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <PeopleIcon /> : <BadgeOutlined />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List> */}
            <List>
                <ListItem>
                    <ListItemButton>
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <NavLink to="/dashboard">
                            <ListItemText primary="Dashboard" />
                        </NavLink>
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton>
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <NavLink to="/dashboard/courses">Courses</NavLink>
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton>
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <NavLink to="/dashboard/users">Users</NavLink>
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton>
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <NavLink to="/dashboard/assignments">Assignments</NavLink>
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            {/* <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List> */}
        </Drawer>
    );
}