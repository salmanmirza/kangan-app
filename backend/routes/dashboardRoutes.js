import express from 'express';
import Course from '../models/coursesModel.js';
import User from '../models/userModel.js';

const router = express.Router();

router.get('/dashboardStats', async (req, res) => {
  try {
    const [totalCourses, totalTeachers, totalStudents] = await Promise.all([
      Course.countDocuments(),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' })
    ]);

    res.status(200).json({
      courses: totalCourses,  // Make sure field names match the frontend
      teachers: totalTeachers,
      students: totalStudents
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
