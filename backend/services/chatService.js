// services/chatService.js
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Course from '../models/coursesModel.js';
import Assignment from '../models/assignmentModel.js';
import Enrollment from '../models/enrollmentModel.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Process messages from authenticated users
export async function processAuthenticatedMessage(message, userId) {
  const user = await User.findById(userId);
  if (!user) {
    return { message: "Sorry, I couldn't find your user information. Please try logging in again." };
  }

  const messageText = message.toLowerCase();
  const role = user.role;

  if (isAboutCourses(messageText)) {
    return await handleCourseQuestions(messageText, user);
  } else if (isAboutAssignments(messageText)) {
    return await handleAssignmentQuestions(messageText, user);
  } else if (isAboutProfile(messageText)) {
    return await handleProfileQuestions(messageText, user);
  } else if (isAboutDashboard(messageText)) {
    return await handleDashboardQuestions(messageText, user);
  } else {
    // GPT fallback for unclassified messages
    try {
      const systemPrompt = `
You are a helpful AI assistant for a TAFE education platform. The user is ${user.firstName} ${user.lastName} and their role is ${user.role}.
They may ask about their profile, dashboard, courses, assignments, exams, or how to use the platform.
If a direct answer is unclear, suggest where they can go (e.g., 'Courses' tab or 'Assignments' page).
Always try to be helpful even if the question is vague.
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.5
      });

      const gptResponse = completion.choices[0].message.content;

      return {
        message: gptResponse || `Hi ${user.firstName}, feel free to ask about your courses, assignments, or profile.`
      };
    } catch (error) {
      console.error('GPT fallback error:', error);
      return {
        message: `Hello ${user.firstName}, I can help you with information about your ${role === 'student' ? 'courses, assignments, and profile.' : role === 'teacher' ? 'courses, assignments, and students.' : 'administrative tasks, users, courses, and enrollments.'}`
      };
    }
  }
}

// Handlers

async function handleCourseQuestions(message, user) {
  try {
    let query = {};

    if (user.role === 'student') {
      const enrollments = await Enrollment.find({ student: user._id });
      const courseIds = enrollments.map(enrollment => enrollment.course);
      query = { _id: { $in: courseIds } };
    } else if (user.role === 'teacher') {
      query = { teacher: user._id };
    }

    const courses = await Course.find(query).populate('teacher');

    if (message.includes('how many') || message.includes('number of')) {
      return {
        message: `You have access to ${courses.length} course${courses.length !== 1 ? 's' : ''}.`
      };
    }

    if (message.includes('list') || message.includes('show me')) {
      if (courses.length === 0) {
        return {
          message: `You don't have any courses ${user.role === 'student' ? 'enrolled' : 'assigned'} at the moment.`
        };
      }

      const courseList = courses.map(course =>
        `• ${course.courseName} ${user.role === 'student' && course.teacher ? `(taught by ${course.teacher.firstName} ${course.teacher.lastName})` : ''}`
      ).join('\n');

      return {
        message: `Here are your ${user.role === 'student' ? 'enrolled' : user.role === 'teacher' ? 'teaching' : 'available'} courses:\n\n${courseList}`
      };
    }

    return {
      message: `You can view your courses by clicking on the "Courses" option in the left sidebar. You currently have access to ${courses.length} course${courses.length !== 1 ? 's' : ''}.`
    };
  } catch (error) {
    console.error('Error handling course question:', error);
    return { message: "Sorry, I had trouble retrieving your course information. Please try again later." };
  }
}

async function handleAssignmentQuestions(message, user) {
  try {
    let assignments = [];

    if (user.role === 'student') {
      const enrollments = await Enrollment.find({ student: user._id });
      const courseIds = enrollments.map(enrollment => enrollment.course);
      assignments = await Assignment.find({ course: { $in: courseIds } })
        .populate('course')
        .sort({ dueDate: 1 });
    } else if (user.role === 'teacher') {
      assignments = await Assignment.find({ teacher: user._id })
        .populate('course')
        .sort({ dueDate: 1 });
    } else {
      assignments = await Assignment.find({})
        .populate('course')
        .populate('teacher')
        .sort({ dueDate: 1 });
    }

    if (message.includes('due') || message.includes('deadline') || message.includes('upcoming')) {
      const now = new Date();
      const upcomingAssignments = assignments.filter(a => new Date(a.dueDate) > now);

      if (upcomingAssignments.length === 0) {
        return { message: "You don't have any upcoming assignments due." };
      }

      const assignmentList = upcomingAssignments.slice(0, 5).map(a =>
        `• "${a.title}" for ${a.course.courseName} due on ${new Date(a.dueDate).toLocaleDateString()}`
      ).join('\n');

      return {
        message: `Here are your upcoming assignments:\n\n${assignmentList}${upcomingAssignments.length > 5 ? '\n\n...and more. Check the Assignments page for the complete list.' : ''}`
      };
    }

    if (message.includes('submit') || message.includes('turn in') || message.includes('upload')) {
      return {
        message: `To submit an assignment:\n\n1. Navigate to the "Assignments" section in the left sidebar\n2. Find the assignment you want to submit\n3. Click on the assignment to view details\n4. Upload your file or enter your submission\n5. Click the Submit button`
      };
    }

    if (message.includes('how many') || message.includes('number of')) {
      return {
        message: `You have ${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} ${user.role === 'student' ? 'to complete' : 'created'}.`
      };
    }

    return {
      message: `You can view all your assignments by clicking on "Assignments" in the left sidebar. ${assignments.length > 0 ? `You currently have ${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}.` : 'You don\'t have any assignments at the moment.'}`
    };
  } catch (error) {
    console.error('Error handling assignment question:', error);
    return { message: "Sorry, I had trouble retrieving your assignment information. Please try again later." };
  }
}

async function handleProfileQuestions(message, user) {
  if (message.includes('update') || message.includes('change') || message.includes('edit')) {
    return {
      message: `To update your profile:\n\n1. Click on your avatar in the top-right corner\n2. Select "Update Profile" from the dropdown menu\n3. Update your information in the form\n4. Click "Update" to save your changes`
    };
  }

  if (message.includes('info') || message.includes('details') || message.includes('my profile')) {
    return {
      message: `Here's your profile information:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nRole: ${user.role}${user.role === 'student' ? `\nRoll Number: ${user.studentRollNo || 'Not set'}\nGuardian: ${user.studentGuardian || 'Not set'}` : ''}`
    };
  }

  return {
    message: `You can view and update your profile by clicking on your avatar in the top-right corner and selecting "Update Profile".`
  };
}

async function handleDashboardQuestions(message, user) {
  return {
    message: `Your dashboard provides an overview of your activity. Here you can see:\n\n${user.role === 'student'
      ? '• Your to-do list of pending questions\n• Quick access to courses and assignments'
      : user.role === 'teacher'
        ? '• Statistics about your courses\n• Number of students enrolled\n• Number of assignments created'
        : '• System-wide statistics\n• Total courses, teachers, and students'
      }\n\nYou can access your dashboard by clicking "Dashboard" in the left sidebar.`
  };
}

// Keyword Matchers

function isAboutCourses(message) {
  const courseKeywords = ['course', 'class', 'subject', 'enrolled', 'teach', 'module'];
  return courseKeywords.some(keyword => message.includes(keyword));
}

function isAboutAssignments(message) {
  const assignmentKeywords = [
    'assignment', 'homework', 'task', 'submit', 'due', 'deadline', 'upload',
    'exam', 'test', 'submission', 'submissions'
  ];
  return assignmentKeywords.some(keyword => message.includes(keyword));
}

function isAboutProfile(message) {
  const profileKeywords = ['profile', 'account', 'my info', 'my details', 'name', 'password', 'email'];
  return profileKeywords.some(keyword => message.includes(keyword));
}

function isAboutDashboard(message) {
  const dashboardKeywords = ['dashboard', 'home', 'main page', 'overview', 'statistics', 'stats'];
  return dashboardKeywords.some(keyword => message.includes(keyword));
}
// Guest message handler
export async function processGuestMessage(message) {
  try {
    const systemPrompt = `
You are a friendly chatbot on a TAFE education platform.
You are assisting a guest user (not yet logged in).
They may ask general questions about courses, assignments, platform use, or how to register or log in.
Encourage them to sign up or log in if they want to access their personal dashboard.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.5
    });

    return {
      message: completion.choices[0].message.content || 'Hello! I can help you learn more about our platform. Feel free to ask anything!'
    };
  } catch (error) {
    console.error('Guest GPT error:', error);
    return {
      message: 'Hi! I can answer questions about our platform. Please try again or log in for personalized help.'
    };
  }
}
