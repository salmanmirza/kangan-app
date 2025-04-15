import express from 'express';
const router = express.Router();
import verifyToken from '../middlewares/authMiddleware.js';
import authorizedRoles from '../middlewares/roleMiddleware.js';
import { Navigate } from 'react-router-dom';
import user from '../models/userModel.js';
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
    console.log(" DELETE /deleteById hit");

    const { _id } = req.body;
    if (!_id) {
        return res.status(400).json({ message: "User ID (_id) is required" });
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