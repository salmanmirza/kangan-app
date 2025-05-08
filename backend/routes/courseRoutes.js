import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import mongoose from 'mongoose';
import path from 'path';
import Course from '../models/coursesModel.js';
import User from '../models/userModel.js';
import verifyToken from '../middlewares/authMiddleware.js'; // Assuming you have a middleware for token verification

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
        console.log(req.body);
        const { courseName, description, teacherId } = req.body; // Added teacherId
        const createdAt = new Date();

        if (!courseName || !description || !teacherId) {
            return res.status(400).json({ error: 'Course name, description, and teacher ID are required' });
        }

        const imgPath = req.file ? `/uploads/${req.file.filename}` : null;

        const newCourse = new Course({
            courseName,
            description,
            imgPath,
            teacher: teacherId, // Assign teacher
            createdAt
        });

        const courseToSave = await newCourse.save();

        // Update teacher's course
        await User.findByIdAndUpdate(teacherId, {
            $addToSet: { course: courseToSave._id }
        });

        res.status(201).json(courseToSave);
    } catch (err) {
        console.error('Error adding new Course:', err);
        res.status(500).json({ error: 'Failed to add new Course' });
    }
});

// getCoursesForTeacher
// GET /courses/getCoursesForTeacher?teacherId=xxxxx
router.get('/getCoursesForTeacher', async (req, res) => {
    try {
        const { teacherId } = req.query;

        if (!teacherId) {
            return res.status(400).json({ error: 'teacherId is required' });
        }

        // No need to convert to ObjectId manually
        const courses = await Course.find({ teacher: teacherId });

        return res.status(200).json({ courses });
    } catch (error) {
        console.error('Error fetching courses for teacher:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});







// Get all courses
router.get('/getAllCourses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 }).populate('teacher').populate('students');
        res.status(200).json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Delete course by ID
router.delete('/deleteCourseByIdByAdmin', async (req, res) => {
    try {
        const { _id } = req.body;

        const deletedCourse = await Course.findByIdAndDelete(_id);

        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Ensure the path is correct by resolving it
        if (deletedCourse.imgPath) {
            const filePath = path.resolve('uploads', deletedCourse.imgPath.replace('/uploads/', ''));

            try {
                // Check if the file exists before attempting to delete
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);  // Delete the image from the filesystem
                }
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }

        // Remove course from teacher's course
        if (deletedCourse.teacher) {
            await User.findByIdAndUpdate(deletedCourse.teacher, {
                $pull: { course: deletedCourse._id }
            });
        }

        // Remove course from all enrolled students
        if (deletedCourse.students.length > 0) {
            await User.updateMany(
                { _id: { $in: deletedCourse.students } },
                { $pull: { courses: deletedCourse._id } }
            );
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
        const { _id, courseName, description, teacherId } = req.body;

        if (!_id) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const existingCourse = await Course.findById(_id);
        if (!existingCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        existingCourse.courseName = courseName || existingCourse.courseName;
        existingCourse.description = description || existingCourse.description;

        if (teacherId && teacherId !== existingCourse.teacher.toString()) {
            // Update teacher reference
            existingCourse.teacher = teacherId;

            // Update teacher's course
            await User.findByIdAndUpdate(teacherId, {
                $addToSet: { course: existingCourse._id }
            });

            // Remove course from previous teacher's course
            if (existingCourse.teacher) {
                await User.findByIdAndUpdate(existingCourse.teacher, {
                    $pull: { course: existingCourse._id }
                });
            }
        }

        if (req.file) {
            const newImagePath = `/uploads/${req.file.filename}`;

            // Check and delete old image if it exists
            if (existingCourse.imgPath) {
                const oldImagePath = path.join('uploads', existingCourse.imgPath.replace('/uploads/', ''));

                try {
                    await fs.unlinkSync(oldImagePath);  // Delete the old image synchronously
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
        const courses = await Course.find().populate('teacher').populate('students');
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch courses', error: err });
    }
});

// Differentiate the courses based on signed-in user role

router.get('/getCoursesByRole', async (req, res) => {
    const { _id } = req.query; // Get user ID from query string

    try {
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            // Admin gets everything
            const allCourses = await Course.find()
                .populate('teacher', 'firstName lastName email')
                .populate('students', 'firstName lastName email');
            return res.status(200).json(allCourses);
        }

        if (user.role === 'teacher') {
            // Teacher can have one course only (user.course)
            if (!user.course) {
                return res.status(200).json([]); // No course assigned
            }

            const course = await Course.findById(user.course)
                .populate('students', 'firstName lastName email');
            return res.status(200).json(course ? [course] : []);
        }

        if (user.role === 'student') {
            // Student may have multiple courses
            if (!user.courses || user.courses.length === 0) {
                return res.status(200).json([]);
            }

            const courses = await Course.find({ _id: { $in: user.courses } })
                .populate('teacher', 'firstName lastName email');
            return res.status(200).json(courses);
        }

        return res.status(400).json({ message: 'Invalid role' });

    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
