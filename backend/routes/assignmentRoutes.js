import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import assignment from '../models/assignmentModel.js';
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
        const { assignmentNo, dueDate } = req.body;
        const assignmentFile = req.file ? req.file.filename : null;

        const newAssignment = new assignment({
            assignmentNo,
            dueDate,
            assignmentFile,
        });

        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating assignment', error: error.message });
    }
});

// Get all assignments
router.get('/getAllAssignments', async (req, res) => {
    try {
        const assignments = await assignment.find();
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
});

// Delete an assignment
router.delete('/deleteAssignmentById', async (req, res) => {
    try {
        const { id } = req.body;  // ID from request body
        const deletedAssignment = await assignment.findByIdAndDelete(id);

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
        res.status(500).json({ message: 'Error deleting assignment', error: error.message });
    }
});

// Update an existing assignment by ID
router.put('/updateAssignmentById', upload.single('assignmentFile'), async (req, res) => {
    try {
        const { id, assignmentNo, dueDate } = req.body; // Get the assignment details and ID from the request body

        // Find the existing assignment by ID
        const existingAssignment = await assignment.findById(id);

        if (!existingAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Create the update object
        const updatedFields = {
            assignmentNo,
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
        const updatedAssignment = await assignment.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });

        // Send back the updated assignment
        res.status(200).json(updatedAssignment);
    } catch (error) {
        console.error('Error updating assignment:', error.message);
        res.status(500).json({ message: 'Error updating assignment', error: error.message });
    }
});

export default router;
