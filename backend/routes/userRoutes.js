import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import Course from '../models/coursesModel.js'; // Assuming you have a Course model
import verifyToken from '../middlewares/authMiddleware.js';
import authorizedRoles from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/admin', verifyToken, authorizedRoles(['admin']), async (req, res) => {
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
router.delete('/deleteById', verifyToken, authorizedRoles(['admin']), async (req, res) => {
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
router.put('/updateUserByIdByAdmin', async (req, res) => {
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
router.post('/addNewUserByAdmin', async (req, res) => {
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



export default router;
