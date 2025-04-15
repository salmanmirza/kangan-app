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
const tableData = [{
  "id": 1,
  "first_name": "Rollo",
  "last_name": "Worcester",
  "email": "rworcester0@geocities.jp",
  "gender": "Male",
  "ip_address": "241.216.250.95"
}, {
  "id": 2,
  "first_name": "Latrena",
  "last_name": "Patriskson",
  "email": "lpatriskson1@digg.com",
  "gender": "Female",
  "ip_address": "65.112.169.52"
}, {
  "id": 3,
  "first_name": "Ailsun",
  "last_name": "Fison",
  "email": "afison2@google.de",
  "gender": "Female",
  "ip_address": "7.192.72.80"
}, {
  "id": 4,
  "first_name": "Terrye",
  "last_name": "Allen",
  "email": "tallen3@dropbox.com",
  "gender": "Female",
  "ip_address": "214.172.54.153"
}, {
  "id": 5,
  "first_name": "Wells",
  "last_name": "Adkins",
  "email": "wadkins4@go.com",
  "gender": "Male",
  "ip_address": "222.229.51.195"
}, {
  "id": 6,
  "first_name": "Leland",
  "last_name": "Curuclis",
  "email": "lcuruclis5@theguardian.com",
  "gender": "Female",
  "ip_address": "141.86.119.67"
}, {
  "id": 7,
  "first_name": "Curr",
  "last_name": "Perico",
  "email": "cperico6@ibm.com",
  "gender": "Male",
  "ip_address": "54.98.136.165"
}, {
  "id": 8,
  "first_name": "Katya",
  "last_name": "Bilovus",
  "email": "kbilovus7@shareasale.com",
  "gender": "Female",
  "ip_address": "72.231.133.48"
}, {
  "id": 9,
  "first_name": "Paul",
  "last_name": "Hatcher",
  "email": "phatcher8@squarespace.com",
  "gender": "Genderfluid",
  "ip_address": "215.83.58.106"
}, {
  "id": 10,
  "first_name": "Cathi",
  "last_name": "Washington",
  "email": "cwashington9@npr.org",
  "gender": "Female",
  "ip_address": "20.83.28.139"
}]


export default function PermanentDrawerLeft() {
  // for open modal in create use case -- start
  // const [open, setOpen] = React.useState(false);
  const [open, setOpen] = useState(false);      ///for default opening to add new record
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    classToTeach: '',
    subjectToTeach: '',
  });

  const handleAddNewUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      classToTeach: '',
      subjectToTeach: '',
    });
    setIsEditMode(false);
    setOpen(true);
  };

  const handleEditAndUpdate = (fetchedData) => {
    setFormData();
    setIsEditMode(true);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      console.log("Update this user in database:", formData);
      // updateUser(formData.id, formData)
    } else {
      axios.post("http://localhost:3001/users/addNewUserByAdmin", formData)
        .then(result => console.log(result))
        .catch(err => console.log(err));
      // addUser(formData)
    }
    handleClose();
  };
  // for open modal in Edit to update use case -- end
  //--------//   


  const [fetchedUsers, setFectchedUsers] = useState([]); // state to store the data from the API
  //axios call to get all the record from db 

  useEffect(() => {

    getUsers();
  }, []);

  const getUsers = async (res, req) => {
    const user = localStorage.getItem("user")
    const abc = JSON.parse(user)

    console.log(abc.role)
    const response = await axios.get("http://localhost:3001/users/admin", {
      params: {
        'role': abc.role,
      },
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`
        // },
      },
      // body: {
      //   abc,

      // }
    });
    setFectchedUsers(response.data)
  }

  ////delete functino call for delete record from Admin crud...start

  const handleDelete = async (e) => {
    // this.setState({val:event.currentTarget.value})
    // e.preventDefault()
    const ID = e.currentTarget.id;
    if (window.confirm("Do you want to delete the Record?")) {
      await axios.delete("http://localhost:3001/users/deleteById", {
        data: { _id: ID },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } else {

    }

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
          {/* <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              Add User</Typography> */}
          <Typography variant="h6" mb={2}>
            {isEditMode ? 'Edit User' : 'Add User'}
          </Typography>
          <Stack spacing={4}>
            <Stack direction='row' spacing={2}
            >
              <TextField name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} />
              <TextField name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} />
              <TextField name="email" label="Email" value={formData.email} onChange={handleChange} />
            </Stack>
            <Stack direction='row' spacing={2} >
              <TextField name="password" label="Password" value={formData.password} onChange={handleChange} />
              <TextField name="classToTeach" label="Class to Teach" value={formData.classToTeach} onChange={handleChange} />
              <TextField name="subjectToTeach" label="Subject to Teach" value={formData.subjectToTeach} onChange={handleChange} />
            </Stack>
            <Stack direction={'row'} spacing={2} >
              <Button variant="contained" type="submit">
                {isEditMode ? 'Update' : 'Add'}
              </Button>

              {/* <Paper elevation={4} sx={{ padding: 7 }} component="form">  
          
              <Typography variant="h3">Add User</Typography>
        
              <TextField id="standard-basic1" name="email" label="Email" variant="standard"  sx={{ marginTop: 4 }} onChange={(e) => setEmail(e.target.value)} />
              <TextField id="standard-basic2" name="password" label="Password" variant="standard"  sx={{ marginTop: 4 }} onChange={(e) => setPassword(e.target.value)} />
                <br></br>
              <TextField id="standard-basic1" name="email" label="Email" variant="standard"  sx={{ marginTop: 4 }} onChange={(e) => setEmail(e.target.value)} />
              <TextField id="standard-basic2" name="password" label="Password" variant="standard"  sx={{ marginTop: 4 }} onChange={(e) => setPassword(e.target.value)} />
            
              <Button variant="contained" type="submit" fullWidth sx={{ marginTop: 6 }}>Login</Button>
            </Paper> */}
            </Stack>
          </Stack>
        </Box>
      </Modal>
      <Drawer
        sx={{
          width: drawerWidth,
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
          {['Students', 'Courses', 'Notifications', 'Account'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <SchoolOutlined /> : <BadgeOutlined />}
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
      <Box
        component="Container"
        sx={{ bgcolor: 'background.default', p: 3 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 3 }}>

          <Button onClick={handleAddNewUser} variant="contained">Add User</Button>
        </Box>
        <TableContainer component={Paper} sx={{ marginTop: 3, minWidth: 1000 }}>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align='center'>Role</TableCell>
                <TableCell align='center'>Record Date</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fetchedUsers.map((row) => (
                <TableRow
                  key={row.firstName}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.firstName}
                  </TableCell>
                  <TableCell>{row.lastName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row?.role}</TableCell>
                  <TableCell align='center'>{row.createdAt}</TableCell>
                  <TableCell> <Button variant="contained" color="info" id={row._id} onClick={() => handleEditAndUpdate()}>Edit</Button> | <Button variant="contained" color="error" id={row._id} onClick={handleDelete}>Delete</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}