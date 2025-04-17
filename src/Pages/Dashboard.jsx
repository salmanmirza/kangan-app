import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

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


const btnstyle = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}
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

///style for modal--end

const drawerWidth = 240;

export default function PermanentDrawerLeft() {
  // for open modal in create use case -- start
  // const [open, setOpen] = React.useState(false);
  const [open, setOpen] = useState(false);      ///for default opening to add new record
  const [isEditMode, setIsEditMode] = useState(false);
  const [role, setRole] = useState('');
  const [value, setValue] = useState(0);

  const [fetchedUsers, setFectchedUsers] = useState([]);
  //axios call to get all the record from db on pageLoad
  useEffect(() => {

    getUsers();
  }, []);

  const getUsers = async (res, req) => {
    const user = localStorage.getItem("user")
    const abc = JSON.parse(user)
    const response = await axios.get("http://localhost:3001/users/admin", {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
    });
    setFectchedUsers(response.data)
  }
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  // Filter the users based on role
  const teachers = fetchedUsers.filter(user => user.role === 'teacher');
  const students = fetchedUsers.filter(user => user.role === 'student');

  // Custom TabPanel component
  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  // a11yProps helper function
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }



  const [formData, setFormData] = useState({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    teachSubject: '',
    teachClass: '',
    studentRollNo: '',
    studentGuardian: '',
    role: '',

  });

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleAddNewUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      teachSubject: '',
      teachClass: '',
      studentRollNo: '',
      studentGuardian: '',
      role: '',
    });
    setIsEditMode(false);
    setOpen(true);
  };

  const handleEditAndUpdate = async (row) => {

    setFormData({
      _id: row._id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      teachClass: row.teachClass || '',
      teachSubject: row.teachSubject || '',
      studentRollNo: row.studentRollNo || '',
      studentGuardian: row.studentGuardian || '',
      rollNo: row.rollNo || '',
      role: row.role || ''
    });
    setIsEditMode(true);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValue(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      const response = await axios.put("http://localhost:3001/users/updateUserByIdByAdmin", formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
      );
      window.location.reload();
    } else {
      axios.post("http://localhost:3001/users/addNewUserByAdmin", formData)
        .then(result => console.log(result))
        .catch(err => console.log(err));
      // addUser(formData)
    }
    handleClose();
    // window.location.reload();
  };
  // for open modal in Edit to update use case -- end
  //--------//   


  ////delete functino call for delete record from Admin crud...start

  const handleDelete = async (e) => {

    const ID = e.currentTarget.id;
    if (window.confirm("Do you want to delete the Record?")) {
      await axios.delete("http://localhost:3001/users/deleteById", {
        data: { _id: ID },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,

        },

      });
    }
    window.location.reload();

  }

  ////delete functino call for delete record from Admin crud...end
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} component={"form"} onSubmit={handleSubmit}>
          <Typography variant="h6" mb={2}>
            {isEditMode ? 'Edit User' : 'Add User'}
          </Typography>

          <Stack spacing={4}>
            <Stack direction="row" spacing={2}>
              <TextField name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} />
              <TextField name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} />
              <TextField name="email" label="Email" value={formData.email} onChange={handleChange} />
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ width: '52ch' }}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange}
                >
                  <MenuItem value={'teacher'}>Teacher</MenuItem>
                  <MenuItem value={'student'}>Student</MenuItem>
                </Select>
              </FormControl>

              <TextField name="password" label="Password" value={formData.password} onChange={handleChange} />
            </Stack>

            {/* while role teacher is selected in form */}
            {formData.role === 'teacher' && (
              <Stack direction="row" spacing={2}>
                <TextField name="teachClass" label="Class to Teach" value={formData.teachClass} onChange={handleChange} />
                <TextField name="teachSubject" label="Subject to Teach" value={formData.teachSubject} onChange={handleChange} />
              </Stack>
            )}

            {/* when the role is student selected in dropdown */}
            {formData.role === 'student' && (
              <>
                <Stack direction="row" spacing={2}>
                  <TextField name="studentRollNo" label="Roll No" value={formData.studentRollNo || ''} onChange={handleChange} />
                  <TextField name="studentGuardian" label="Guardian" value={formData.studentGuardian || ''} onChange={handleChange} />
                </Stack>
              </>
            )}

            <Stack direction="row" spacing={2}>
              <Button variant="contained" type="submit">
                {isEditMode ? 'Update' : 'Add'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
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
      <Box component="Container" sx={{ bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 3 }}>
        <Button onClick={handleAddNewUser} variant="contained">Add User</Button>
      </Box>

      <TableContainer component={Paper} sx={{ marginTop: 3, minWidth: 1100 }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleTabChange} aria-label="user role tabs">
              <Tab label="Teachers" {...a11yProps(0)} />
              <Tab label="Students" {...a11yProps(1)} />
            </Tabs>
          </Box>
          
          <CustomTabPanel value={value} index={0}>
            <Table aria-label="teacher">
              <TableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Role</TableCell>
                  <TableCell align="center">Subject To Teach</TableCell>
                  <TableCell align="center">Teach Class</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell component="th" scope="row">{row.firstName}</TableCell>
                    <TableCell align="center">{row.lastName}</TableCell>
                    <TableCell align="center">{row.email}</TableCell>
                    <TableCell align="center">{row.role}</TableCell>
                    <TableCell align="center">{row.teachSubject}</TableCell>
                    <TableCell align="center">{row.teachClass}</TableCell>
                    <TableCell align="center">
                      <Button variant="contained" color="info" onClick={() => handleEditAndUpdate(row)}>Edit</Button> | 
                      <Button variant="contained" color="error" onClick={() => handleDelete(row._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            <Table aria-label="student">
              <TableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Role</TableCell>
                  <TableCell align="center">St. RollNo.</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell component="th" scope="row">{row.firstName}</TableCell>
                    <TableCell align="center">{row.lastName}</TableCell>
                    <TableCell align="center">{row.email}</TableCell>
                    <TableCell align="center">{row.role}</TableCell>
                    <TableCell align="center">{row.studentRollNo}</TableCell>
                    <TableCell align="center">
                      <Button variant="contained" color="info" onClick={() => handleEditAndUpdate(row)}>Edit</Button> | 
                      <Button variant="contained" color="error" onClick={() => handleDelete(row._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CustomTabPanel>
        </Box>
      </TableContainer>
    </Box>
    </Box>
  );
}