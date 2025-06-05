import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import bcrypt from 'bcrypt';
import Course from '../models/coursesModel.js';
import User from '../models/userModel.js';
import verifyToken from '../middlewares/authMiddleware.js';
import authorizedRoles from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/admin',verifyToken,authorizedRoles("admin","teacher"), async (req, res) => {
    try {
        const userData = await User.find()
            .populate('courses')  // Populate courses for students (array of courses)
            .populate('course');  // Populate course for teachers (single course)

        res.status(200).json(userData);  // Return the populated user data
    } catch (error) {
        console.error('Error while fetching data', error);
        res.status(500).json({ message: 'Error while fetching data', error });
    }
});




// Delete user by ID (Admin only)
router.delete('/deleteById',verifyToken,authorizedRoles("admin"), async (req, res) => {
    const { _id } = req.body;
    if (!_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const result = await User.deleteOne({ _id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user by ID (Admin only)
router.put('/updateUserByIdByAdmin',verifyToken,authorizedRoles("admin"), async (req, res) => {
    const {
        _id,
        firstName,
        lastName,
        email,
        password,
        role,
        course,          // Single course for teacher
        courses,         // Array of courses for student
        studentRollNo,
        studentGuardian
    } = req.body;

    if (!_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        let hashedPassword;
        if (password && password.trim() !== '') {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const updateData = {
            firstName,
            lastName,
            email,
            role,
            studentRollNo,
            studentGuardian,
            updatedAt: Date.now(),
        };

        if (hashedPassword) updateData.password = hashedPassword;

        // Assign course or courses based on the role
        if (role === 'teacher') {
            updateData.course = course;  // Single course for teacher
        } else if (role === 'student') {
            updateData.courses = courses;  // Multiple courses for student
        }

        // Update the user in the database
        const updatedUser = await User.findOneAndUpdate({ _id }, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User Updated successfully', updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// Add new user by admin
router.post('/addNewUserByAdmin',verifyToken,authorizedRoles("admin"), async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            course,         // Single course (for teachers)
            courses,        // Array of courses (for students)
            studentRollNo,
            studentGuardian
        } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            studentRollNo,
            studentGuardian,
            // Assign courses for students (array of course IDs)
            courses: role === 'student' ? courses : [],
            // Assign single course for teachers
            course: role === 'teacher' ? course : null
        });

        // Save the user
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);  // Return the saved user
    } catch (err) {
        console.error('Error adding new user:', err);
        res.status(500).json({ error: 'Failed to add user' });
    }
});

router.get('/getAllTeachers', async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' }).select('-password');
        res.status(200).json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get list of users with role 'student'
router.get('/getAllUserWithRoleStd', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }); // Find users with role 'student'

        if (!students.length) {
            return res.status(404).json({ message: 'No students found' });
        }

        return res.status(200).json(students); // Return students
    } catch (err) {
        console.error('Error fetching students:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/totalEnrolledStds',verifyToken,authorizedRoles("teacher"), async (req, res) => {
    try {
        const { teacherId } = req.query; // Assuming req.user is populated via auth middleware

        // Find the teacher and get their course
        const teacher = await User.findById(teacherId).select('role course');

        if (!teacher || teacher.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied: only teachers can access this.' });
        }

        // Count students enrolled in this course
        const count = await User.countDocuments({
            role: 'student',
            courses: teacher.course
        });

        res.status(200).json({ studentCount: count });
    } catch (err) {
        console.error('Failed to get student count:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// GET: Fetch user by ID
router.get('/getUserToUpdateById', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT: Update user by ID
router.put('/editUpdateUserById', async (req, res) => {
    try {
        const { userId } = req.query;
        const { firstName, lastName, email, password } = req.body;

        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        const updateFields = { firstName, lastName, email, updatedAt: new Date() };

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// PATCH /users/disableFirstLogin
router.patch('/disableFirstLogin', async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findByIdAndUpdate(
        userId,
        { firstLogin: false },
        { new: true }
      );
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update firstLogin flag' });
    }
  });
  
export default router;
