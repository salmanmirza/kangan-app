// const user = require("../models/userModel.js");
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// const jwt = require("jsonwebtoken");
import mongoose from 'mongoose';

const secret = "k4ng4n123";

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
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required." });
    }

    // Find user by email and role
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(404).json({ message: "User not found or role mismatch." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secret,
      { expiresIn: "1h" }
    );
    const responseUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      // Only include these if they exist:
      studentRollNo: user.studentRollNo || undefined,
      studentGuardian: user.studentGuardian || undefined,
      course: user.course || undefined,
      courses: user.courses || undefined,
    };

    // Include firstLogin only for students
    if (user.role === 'student') {
      responseUser.firstLogin = user.firstLogin ?? true;
    }

    return res.status(200).json({ message: "Success", token, user: responseUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong on login." });
  }
};
export { register, login };