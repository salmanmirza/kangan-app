import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import Box from "@mui/material/Box";
import Link from '@mui/material/Link';
import React from "react";
import { useState } from "react";
import { Stack, TextField } from "@mui/material";
import axios from "axios";


export default function Register() {

    const[email,setEmail]   =  useState();
    const[password,setPassword] =   useState(); 
    const[fname,setFname] = useState();
    const[lname,setLname] = useState(); 
   
    const handleSubmit = async (e) => {
        e.preventDefault()
        axios.post("http://localhost:3001/auth/register", {
            fname,
            lname,
            email,
            password
        }).then(result => console.log(result))
        .catch(err => console.log(err))
        console.log(fname, lname, email, password);    
    }   
    // backgroundColor: "#d3d3d3"

    return (
        <>
            <Container>
                <Stack direction="column" alignItems="center">
                    <Paper elevation={2} sx={{ padding: 7 }} component="form" onSubmit={handleSubmit} >
                        <Typography variant="h3">Register</Typography>
                        {/* <Stack spacing={2}>  */}
                        <TextField id="standard-basic1" name="fname" label="First Name" variant="standard" fullWidth sx={{ marginTop: 4 }} onChange={(e)=> setFname(e.target.value) } />
                        <TextField id="standard-basic2" name="lname" label="Last Name" variant="standard" fullWidth sx={{ marginTop: 4 }} onChange={(e)=> setLname(e.target.value) } />
                        <TextField id="standard-basic3" name="email" label="Email" variant="standard" fullWidth sx={{ marginTop: 4 }} onChange={(e)=> setEmail(e.target.value) }/>
                        <TextField id="standard-basic4" name="password" label="Password" variant="standard" fullWidth sx={{ marginTop: 4 }}  onChange={(e)=> setPassword(e.target.value) }/>
                        {/* </Stack> */}
                        <Button variant="contained" type="submit" fullWidth sx={{ marginTop: 6 }}>Register</Button>
                        <Box sx={{ marginTop: 4 }}>
                        {/*this is comment by irfan */}
                            <Typography variant="h8" sx={{ marginRight: 1 }}>Already a User?</Typography><Link href="/" underline="none">Login</Link>
                        </Box>
                    </Paper>
                </Stack>
            </Container>
        </>
    );
}