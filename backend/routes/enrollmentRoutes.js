import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import Enrollment from '../models/enrollmentModel.js';

const router = express.Router();

// 1. Get all enrollments
router.get('/getAllEnrollments', async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('student', 'firstName lastName studentRollNo') // Populate student details
            .populate('course', 'courseName'); // Populate course name
        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching enrollments', error });
    }
});

// 2. Get enrollment by ID
router.get('/getEnrollmentById/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const enrollment = await Enrollment.findById(id)
            .populate('student', 'firstName lastName studentRollNo')
            .populate('course', 'courseName');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        res.status(200).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching enrollment', error });
    }
});

// 3. Add a new enrollment
router.post('/addEnrollment', async (req, res) => {
    try {
        const { student, course, status } = req.body;

        const newEnrollment = new Enrollment({
            student,
            course,
            status,
        });

        await newEnrollment.save();
        res.status(201).json({ message: 'Enrollment added successfully', newEnrollment });
    } catch (error) {
        res.status(500).json({ message: 'Error adding enrollment', error });
    }
});

// 4. Update enrollment by ID
router.put('/updateEnrollmentById', async (req, res) => {
    const { _id, student, course, status } = req.body;

    try {
        const updatedEnrollment = await Enrollment.findByIdAndUpdate(
            _id,
            { student, course, status, updatedAt: Date.now() },
            { new: true } // Return the updated enrollment
        )
            .populate('student', 'firstName lastName studentRollNo')
            .populate('course', 'courseName');

        if (!updatedEnrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        res.status(200).json({ message: 'Enrollment updated successfully', updatedEnrollment });
    } catch (error) {
        res.status(500).json({ message: 'Error updating enrollment', error });
    }
});

// 5. Delete enrollment by ID
router.delete('/deleteEnrollmentById', async (req, res) => {
    const { id } = req.body;

    try {
        const deletedEnrollment = await Enrollment.findByIdAndDelete(id);
        if (!deletedEnrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        res.status(200).json({ message: 'Enrollment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting enrollment', error });
    }
});

export default router;
