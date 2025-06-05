import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import verifyToken from '../middlewares/authMiddleware.js'; // token middleware
import Assignment from '../models/assignmentModel.js';
import Course from '../models/coursesModel.js';
import User from '../models/userModel.js';
import Submission from '../models/submissionModel.js';

const router = express.Router();

// --------------------- Multer Configuration ---------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/submissions/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// --------------------- Submit Assignment (Student) ---------------------
router.post('/submitAssignment', upload.single('file'), async (req, res) => {
  try {
    const { assignmentId, courseId, studentId, textResponse, comment } = req.body;

    if (!assignmentId || !courseId || !studentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const fileUrl = req.file?.filename || null;

    const submission = new Submission({
      assignment: assignmentId,
      course: courseId,
      student: studentId,
      fileUrl,
      textResponse,
      comment
    });

    await submission.save();
    res.status(201).json({ message: 'Submission successful', submission });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Submission failed', error: err.message });
  }
});

// --------------------- Student: View Their Submissions ---------------------
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await Submission.find({ student: studentId })
      .populate('assignment', 'title assignmentNo dueDate')
      .populate('course', 'courseName')
      .populate('student', 'firstName lastName')
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch student submissions', error: err.message });
  }
});

// --------------------- Teacher: View All Submissions ---------------------
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const assignments = await Assignment.find({ teacher: teacherId });
    const assignmentIds = assignments.map(a => a._id);

    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title assignmentNo')
      .populate('student', 'firstName lastName')
      .populate('course', 'courseName');

    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch teacher submissions', error: err.message });
  }
});

// --------------------- Admin: Fetch All Submissions ---------------------
router.get('/admin', async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title assignmentNo')
      .populate('student', 'firstName lastName')
      .populate('course', 'courseName');

    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all submissions', error: err.message });
  }
});

export default router;
