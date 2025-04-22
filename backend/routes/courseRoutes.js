import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import course from '../models/coursesModel.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join('uploads');
        fs.ensureDirSync(uploadPath); // Ensure the upload folder exists
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extname = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname); // Generate unique filename
    }
});

const upload = multer({ storage });

// Serve static files from the 'uploads' folder

// Route to handle adding a new course
router.post('/addNewCourseByAdmin', upload.single('imgPath'), async (req, res) => {
    try {
        const { courseName, description } = req.body;
        const createdAt = new Date(); // Set the createdAt to the current date-time

        if (!courseName || !description) {
            return res.status(400).json({ error: 'Course name and description are required' });
        }

        // Ensure imgPath is the relative path to the uploaded image file
        const imgPath = req.file ? `/uploads/${req.file.filename}` : null;

        const newCourse = new course({
            courseName,
            description,
            imgPath,
            createdAt
        });

        const courseToSave = await newCourse.save();
        res.status(201).json(courseToSave);
    } catch (err) {
        console.error('Error adding new Course:', err);
        res.status(500).json({ error: 'Failed to add new Course' });
    }
});




router.get('/getAllCourses', async (req, res) => {
    try {
        const courses = await course.find().sort({ createdAt: -1 }); // sort newest first
        res.status(200).json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

//delete method

router.delete('/deleteCourseByIdByAdmin', async (req, res) => {
    try {
        const { _id } = req.body;

        // Find and delete the course by ID
        const deletedCourse = await course.findByIdAndDelete(_id);

        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If course has an associated image, try to delete it
        if (deletedCourse.imgPath) {
            const filePath = path.join('G:/UNIVERSITY DATA/MSICT/SEMESTER 4/IDP/Final project/Kangan App/backend', deletedCourse.imgPath); // Correctly join the file path

            // Log the path being used for debugging purposes
            console.log('Attempting to delete file at:', filePath);

            try {
                fs.unlinkSync(filePath); // Delete the image from the server
                console.log('File deleted successfully');
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// update single record
// Update course by Admin (with optional image overwrite)
router.put('/updateCourseByIdByAdmin', upload.single('imgPath'), async (req, res) => {
    try {
        const { _id, courseName, description } = req.body;

        // Ensure that _id is provided
        if (!_id) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        // Fetch the existing course from DB
        const existingCourse = await course.findById(_id);
        if (!existingCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Update fields (if they are provided)
        existingCourse.courseName = courseName || existingCourse.courseName;
        existingCourse.description = description || existingCourse.description;

        // If a new image is uploaded, overwrite the old image
        if (req.file) {
            const newImagePath = `/uploads/${req.file.filename}`;

            // Delete the old image if it exists
            if (existingCourse.imgPath) {
                const oldImagePath = path.join(
                    'G:/UNIVERSITY DATA/MSICT/SEMESTER 4/IDP/Final project/Kangan App/backend',
                    existingCourse.imgPath
                );

                try {
                    fs.unlinkSync(oldImagePath);  // Delete old image from disk
                    console.log('Old image deleted successfully');
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }

            // Update the imgPath to the new image
            existingCourse.imgPath = newImagePath;
        }

        // Save the updated course in the database
        const updatedCourse = await existingCourse.save();
        res.status(200).json(updatedCourse);

    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).json({ message: 'Failed to update course' });
    }
});





export default router;
