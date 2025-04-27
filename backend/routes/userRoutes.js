import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();
import verifyToken from '../middlewares/authMiddleware.js';
import authorizedRoles from '../middlewares/roleMiddleware.js';
import { Navigate } from 'react-router-dom';
import user from '../models/userModel.js';

const sercret = "k4ng4n123";
//only admin can access this route ------admin routes
router.get('/admin', verifyToken, authorizedRoles("{admin}"), async (req, res) => {

    try {
        const userData = await user.find();
        res.send(userData);
    } catch (e) {
        res.json("Error while fetching data", e);
    }
    // if(req.user.role === "admin"){
    res.json('hello from admin panel');

    // }
    return Navigate('/register');
});
router.delete('/deleteById', async (req, res) => {

    const { _id } = req.body;
    if (!_id) {
        return res.status(400).json({ message: "User ID  is required" });
    }

    try {
        const result = await user.deleteOne({ _id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});


//updateById after editing on view
router.put('/updateUserByIdByAdmin', async (req, res) => {

    // const { _id } = req.body;
    // console.log(req.body)
    // console.log(_id);
    const { _id, firstName, lastName, email, password, department, qualification, role, studentRollNo, studentGuardian } = req.body;
    if (!_id) {
        return res.status(400).json({ message: "User ID  is required" });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const updateData = {
            _id,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            department,
            qualification,
            role,
            studentRollNo,
            studentGuardian,
            updatedAt: Date.now(),
        };
        const updatedUser = await user.findOneAndUpdate(
            { _id },
            updateData,
            // { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User Updated successfully" });
    } catch (error) {
        console.error("Error updating record:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});
//update userProfile by id
router.get('/getUserToUpdateById', async (req, res) => {
    const { userId } = req.query;

    console.log("UserID from query:", userId);

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const _user = await user.findById(userId);

        if (!_user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: _user._id,
            firstName: _user.firstName,
            lastName: _user.lastName,
            email: _user.email
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
////update after edit record
router.put('/editUpdateUserById', async (req, res) => {
    const { userId } = req.query;
    const { firstName, lastName, email, password } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const updateData = {
            firstName,
            lastName,
            email,
            updatedAt: Date.now(),
        };
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await user.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/addNewUserByAdmin', async (req, res) => {
    try {
        const { firstName, lastName, email, password, department, qualification, role, studentRollNo, studentGuardian } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new user({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            department,
            qualification,
            role,
            studentRollNo,
            studentGuardian,
        });

        const userToSave = await newUser.save();
        res.status(201).json(userToSave);
    } catch (err) {
        console.error('Error adding new user:', err);
        res.status(500).json({ error: 'Failed to add user' });
    }
});

//get all users with role teacher on course addition
router.get('/getAllTeachers', async (req, res) => {
    try {
        const teachers = await user.find({ role: 'teacher' });

        if (!teachers || teachers.length === 0) {
            return res.status(404).json({ message: 'No teachers found' });
        }

        // Optionally filter the response fields
        const formattedTeachers = teachers.map(teacher => ({
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            department: teacher.department,
            qualification: teacher.qualification
        }));

        res.json(formattedTeachers);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
//getAllUserWithRoleStd
router.get('/getAllUserWithRoleStd', async (req, res) => {
    try {
        const students = await user.find({ role: 'student' });
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch students', error: err });
    }
});





// only teacher can access this route ------teacher routes
router.get('/teacher', verifyToken, authorizedRoles("admin", "teacher"), (req, res) => {
    res.send('Teacher route -- welcome TEACHER');
    // res.json('hello from teacher panel');
});

// only student can access this route ------student routes
router.get('/student', verifyToken, authorizedRoles("admin", "teacher", "student"), (req, res) => {
    res.send('Student route -- welcome STUDENT');
});

export default router;