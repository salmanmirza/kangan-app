// const express = require("express");
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
// const mongoose = require("mongoose");
// const cors = require("cors");
import cors from 'cors';
// const userModel = require('./models/user');

import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import user from './models/userModel.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import enrollmentsRoutes from "./routes/enrollmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"
import QuestionRoutes from './routes/QuestionRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import guestChatRoutes from './routes/guestChatRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());



mongoose.connect("mongodb://127.0.0.1:27017/kangan");
// app.use('uploads', express.static(path.join('uploads')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads/assignments', express.static(path.join(process.cwd(), 'uploads/assignments')));
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/enrollments", enrollmentsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/questions", QuestionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/submissions', submissionRoutes);
app.use('/api/guest/chat', guestChatRoutes);

// app.use("/auth", require("./routes/authRoutes.js"));


// app.post("/login", async (req, res, next) => {
//     const { email, password } = req.body;
//     const user = await userModel.findOne({ email: email });
//     const hashed = bycrypt.hash(user.password, 10);

//     const sercret = "k4ng4n123";
//     console.log(user);
//     if (!user) {
//         return res.json("User not found")
//     }
//     const isMatch = await bycrypt.compare(password, user.password);

//     // if (!isMatch) {
//     //     return res.json("Wrong password")
//     // }
//     // return res.json("Success")      
//     if (isMatch) {
//         const token = jwt.sign({ email: user.email }, sercret, { expiresIn: '1h' });
//         console.log(token);
//         if (!token) {
//             return res.json("No token provided --access denied");
//         } else {
//             return res.json({

//                'token':  token,
//                 'message': "Success",
//                 'user': user


//             });
//         }
//     } else {
//         res.json('Wrong Password');
//     }
// })

// app.get('/dashboard', verifyToken, (req, res) => {
//     if (req.data === 'Success') {
//         const token = req.headers.authorization;
//         console.log(token);
//         res.json("token is matched and verified")
//         console.log("token is matched and verified")

//     }

// })


//////already commented out the function///////////start
// function verifyToken(req, res, next) {

//     const token = req.headers.authorization;
//     if (!token) {
//         return res.json("No token provided --access denied");
//     } try {
//         const decoded = jwt.verify(token, sercret);
//         req.user = decoded;
//         console.log(decoded);
//         next()
//         return res.json("Success")
//     } catch (error) {
//         res.json("invalid token entered");
//     }
// };////////////...end of function///////////




// app.post('/register', async (req, res) => {
//     const { fname, lname, email, password } = req.body;
//     const hash = await bycrypt.hash(password, 10);
//     userModel.create({
//         fName: fname,
//         lName: lname,
//         email: email,
//         password: hash
//     })
//         .then(user => res.json(user))
//         .catch(err => res.json(err))
//     console.log(fname, lname, email, password)
//     console.log(hash)
// })

app.listen(3001, () => {
    console.log("Server is running on port 3001");
    // 

});
