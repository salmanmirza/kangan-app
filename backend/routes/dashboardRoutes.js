import express from 'express';
import User from '../models/userModel.js';
import Course from '../models/coursesModel.js';
import Assignment from '../models/assignmentModel.js';
import Enrollment from '../models/enrollmentModel.js';

const router = express.Router();

router.get('/dashboardStats', async (req, res) => {
  const { role, teacherId } = req.query;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    if (role === 'admin') {
      const [totalCourses, totalTeachers, totalStudents] = await Promise.all([
        Course.countDocuments(),
        User.countDocuments({ role: 'teacher' }),
        User.countDocuments({ role: 'student' }),
      ]);

      return res.status(200).json({
        courses: totalCourses,
        teachers: totalTeachers,
        students: totalStudents,
      });
    }

    // Inside your /dashboardStats endpoint for the teacher role
    // Inside your /dashboardStats endpoint for the teacher role
    if (role === 'teacher') {
      if (!teacherId) {
        return res.status(400).json({ message: 'Teacher ID is required' });
      }

      // Get all courses taught by this teacher
      const courses = await Course.find({ teacher: teacherId });

      // Count total assignments created by the teacher
      const assignmentsCount = await Assignment.countDocuments({ teacher: teacherId });

      // Get all unique students enrolled in those courses
      const courseIds = courses.map(course => course._id);
      const enrolledStudents = await Enrollment.find({ course: { $in: courseIds } }).distinct('student');

      // Calculate the stats
      const totalCourses = courses.length;
      const totalAssignments = assignmentsCount;
      const totalEnrolledStudents = enrolledStudents.length; // Get the count of unique students

      // Return the stats as a response
      return res.status(200).json({
        totalCourses,
        totalAssignments,
        totalEnrolledStudents,
      });
    }


    return res.status(400).json({ message: 'Invalid role' });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
