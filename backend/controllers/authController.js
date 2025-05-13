// const user = require("../models/userModel.js");
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// const jwt = require("jsonwebtoken");
import mongoose from 'mongoose';

const sercret = "k4ng4n123";

const register = async (req, res) => {
    console.log(req.body);
    try {
        const { fname, lname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({

            fname: fname,
            lname: lname,
            email: email,
            password: hashedPassword,
            role: {
                enum: "admin" //user == student in our case for now/
            }
        })
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', newUser });
    } catch (error) {
        res.status(500).json({ message: "Something went Wrong on creation user", newUser });
    }

}


const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found--invalid email" })
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ email: user.email, role: user.role }, sercret, { expiresIn: '1h' });

        console.log(token);
        res.status(200).json({ message: "Success", "token": token, "user": user });
        if (!token) {
            return res.status(401).json({ message: "No token provided --access denied" });
        }

        return res.status(200).json({ message: "Success", token, user });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong on login" });

    }

}
export { register, login };