import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import Assignment from '../models/assignmentModel.js'; // Ensure that the model is imported
import Course from '../models/coursesModel.js';  // Assuming you have a `Course` model
import User from '../models/userModel.js';  // Assuming you have a `User` model (teacher)

const router = express.Router();

// File upload setup with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/assignments');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Create a new assignment
router.post('/addAssignmentByTeacher', upload.single('assignmentFile'), async (req, res) => {
    try {
        const { title, description, assignmentNo, course, teacher, dueDate } = req.body;
        const assignmentFile = req.file ? req.file.filename : null;

        const newAssignment = new Assignment({
            title,
            description,
            assignmentNo,
            course,
            teacher,
            dueDate,
            assignmentFile,
        });

        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (error) {
        console.error('Error creating assignment:', error.message);
        res.status(500).json({ message: 'Error creating assignment', error: error.message });
    }
});

// Get all assignments (populate course and teacher)
router.get('/getAllAssignments', async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate('course')  // Populate the course field with its details
            .populate('teacher'); // Populate the teacher field with its details

        res.status(200).json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error.message);
        res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
});

// Delete an assignment
router.delete('/deleteAssignmentById', async (req, res) => {
    try {
        const { id } = req.body;  // ID from request body
        const deletedAssignment = await Assignment.findByIdAndDelete(id);

        if (!deletedAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Delete the file if it exists
        if (deletedAssignment.assignmentFile) {
            const filePath = path.join(process.cwd(), 'uploads/assignments', deletedAssignment.assignmentFile);
            try {
                const exists = await fs.pathExists(filePath);
                if (exists) {
                    await fs.remove(filePath);
                }
            } catch (fileError) {
                return res.status(500).json({ message: 'Error deleting attachment file', error: fileError.message });
            }
        }

        res.status(200).json({ message: 'Assignment and attachment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error.message);
        res.status(500).json({ message: 'Error deleting assignment', error: error.message });
    }
});

// Update an existing assignment by ID
router.put('/updateAssignmentById', upload.single('assignmentFile'), async (req, res) => {
    try {
        const { id, title, description, assignmentNo, course, teacher, dueDate } = req.body; // Get the assignment details and ID from the request body

        // Find the existing assignment by ID
        const existingAssignment = await Assignment.findById(id);

        if (!existingAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Create the update object
        const updatedFields = {
            title,
            description,
            assignmentNo,
            course,
            teacher,
            dueDate,
        };

        // If there is a new file, replace the old one
        if (req.file) {
            // Delete the old file if it exists
            if (existingAssignment.assignmentFile) {
                const oldFilePath = path.join(process.cwd(), 'uploads/assignments', existingAssignment.assignmentFile);
                if (await fs.pathExists(oldFilePath)) {
                    await fs.remove(oldFilePath);
                }
            }
            updatedFields.assignmentFile = req.file.filename;
        }

        // Perform the update
        const updatedAssignment = await Assignment.findByIdAndUpdate(id, { $set: updatedFields }, { new: true })
            .populate('course') // Populate course details after update
            .populate('teacher'); // Populate teacher details after update

        res.status(200).json(updatedAssignment);
    } catch (error) {
        console.error('Error updating assignment:', error.message);
        res.status(500).json({ message: 'Error updating assignment', error: error.message });
    }
});

export default router;
