// const express = require("express");
import express from 'express';
import mongoose from 'mongoose';
// const mongoose = require("mongoose");
// const cors = require("cors");
import cors from 'cors';
// const userModel = require('./models/user');
import userModel from './models/user.js';
import bycrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(cors());



mongoose.connect("mongodb://127.0.0.1:27017/kangan");

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({email: email});
    const hashed = bycrypt.hash(user.password, 10);
console.log(user);
    if (!user) {
        return res.json("User not found")
    }
    const isMatch = await bycrypt.compare(password, user.password);
    
    if (!isMatch) {
        return res.json("Wrong password")
    }
    return res.json("Success")      


})


app.post('/register', async (req, res) => {
    const { fname, lname, email, password } = req.body;
    const hash = await bycrypt.hash(password, 10);
    userModel.create({
        fName: fname,
        lName: lname,
        email: email,
        password: hash
    })
        .then(user => res.json(user))
        .catch(err => res.json(err))
    console.log(fname, lname, email, password)
    console.log(hash)
})

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
