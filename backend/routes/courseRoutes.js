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

// Route to handle adding a new course
router.post('/addNewCourseByAdmin', upload.single('imgPath'), async (req, res) => {
    try {
        const { courseName, description } = req.body; // Removed teacher reference
        const createdAt = new Date();

        if (!courseName || !description) {
            return res.status(400).json({ error: 'Course name and description are required' });
        }

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

// Get all courses
router.get('/getAllCourses', async (req, res) => {
    try {
        const courses = await course.find().sort({ createdAt: -1 }); // sort newest first
        res.status(200).json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Delete course by ID
// Delete course by ID
router.delete('/deleteCourseByIdByAdmin', async (req, res) => {
    try {
        const { _id } = req.body;

        const deletedCourse = await course.findByIdAndDelete(_id);

        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Ensure the path is correct by resolving it
        if (deletedCourse.imgPath) {
            const filePath = path.resolve('uploads', deletedCourse.imgPath.replace('/uploads/', ''));
            console.log('Attempting to delete file at:', filePath);

            try {
                // Check if the file exists before attempting to delete
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);  // Delete the image from the filesystem
                    console.log('File deleted successfully');
                } else {
                    console.log('File does not exist:', filePath);
                }
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



// Update course by ID
router.put('/updateCourseByIdByAdmin', upload.single('imgPath'), async (req, res) => {
    try {
        const { _id, courseName, description } = req.body; // Removed teacher reference

        if (!_id) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const existingCourse = await course.findById(_id);
        if (!existingCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        existingCourse.courseName = courseName || existingCourse.courseName;
        existingCourse.description = description || existingCourse.description;

        if (req.file) {
            const newImagePath = `/uploads/${req.file.filename}`;

            // Check and delete old image if it exists
            if (existingCourse.imgPath) {
                const oldImagePath = path.join('uploads', existingCourse.imgPath.replace('/uploads/', '')); // Ensure it's the correct file path

                try {
                    await fs.unlinkSync(oldImagePath);  // Delete the old image synchronously
                    console.log('Old image deleted successfully');
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }

            existingCourse.imgPath = newImagePath;  // Update the image path with the new image
        }

        const updatedCourse = await existingCourse.save();
        res.status(200).json(updatedCourse);

    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).json({ message: 'Failed to update course' });
    }
});


// Public Route to get all courses
router.get('/all', async (req, res) => {
    try {
        const courses = await course.find();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch courses', error: err });
    }
});

export default router;