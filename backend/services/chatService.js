// services/chatService.js
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Course from '../models/coursesModel.js';
import Assignment from '../models/assignmentModel.js';
import Enrollment from '../models/enrollmentModel.js';

// Process messages from authenticated users
export async function processAuthenticatedMessage(message, userId) {
  // Get user context
  const user = await User.findById(userId);
  if (!user) {
    return { message: "Sorry, I couldn't find your user information. Please try logging in again." };
  }

  const messageText = message.toLowerCase();
  const role = user.role;

  // Check message type to route to appropriate handler
  if (isAboutCourses(messageText)) {
    return await handleCourseQuestions(messageText, user);
  } 
  else if (isAboutAssignments(messageText)) {
    return await handleAssignmentQuestions(messageText, user);
  }
  else if (isAboutProfile(messageText)) {
    return await handleProfileQuestions(messageText, user);
  }
  else if (isAboutDashboard(messageText)) {
    return await handleDashboardQuestions(messageText, user);
  }
  else {
    // General help based on role
    return {
      message: `Hello ${user.firstName}! I can help you with information about your ${role === 'student' ? 'courses, assignments, and profile.' : role === 'teacher' ? 'courses, assignments, and students.' : 'administrative tasks, users, courses, and enrollments.'}`
    };
  }
}

// Course-related questions handler
async function handleCourseQuestions(message, user) {
  try {
    let query = {};
    
    // Build query based on user role
    if (user.role === 'student') {
      // For students, find enrollments first
      const enrollments = await Enrollment.find({ student: user._id });
      const courseIds = enrollments.map(enrollment => enrollment.course);
      query = { _id: { $in: courseIds } };
    } 
    else if (user.role === 'teacher') {
      query = { teacher: user._id };
    }
    // Admins can see all courses (empty query)
    
    // Get courses based on query
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
        `• ${course.courseName} ${user.role === 'student' ? (course.teacher ? `(taught by ${course.teacher.firstName} ${course.teacher.lastName})` : '') : ''}`
      ).join('\n');
      
      return {
        message: `Here are your ${user.role === 'student' ? 'enrolled' : user.role === 'teacher' ? 'teaching' : 'available'} courses:\n\n${courseList}`
      };
    }

    if (courses.length === 0) {
      return {
        message: `You don't have any courses ${user.role === 'student' ? 'enrolled' : 'assigned'} at the moment. ${user.role === 'student' ? 'Please contact your administrator to enroll in courses.' : 'You can add courses from the Courses section.'}`
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

// Assignment-related questions handler
async function handleAssignmentQuestions(message, user) {
  try {
    let assignments = [];
    
    if (user.role === 'student') {
      // Get enrolled course IDs
      const enrollments = await Enrollment.find({ student: user._id });
      const courseIds = enrollments.map(enrollment => enrollment.course);
      
      // Get assignments for those courses
      assignments = await Assignment.find({ course: { $in: courseIds } })
        .populate('course')
        .sort({ dueDate: 1 });
    } 
    else if (user.role === 'teacher') {
      assignments = await Assignment.find({ teacher: user._id })
        .populate('course')
        .sort({ dueDate: 1 });
    }
    else {
      // Admin sees all assignments
      assignments = await Assignment.find({})
        .populate('course')
        .populate('teacher')
        .sort({ dueDate: 1 });
    }
    
    if (message.includes('due') || message.includes('deadline') || message.includes('upcoming')) {
      // Filter to only upcoming assignments
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

// Profile-related questions handler
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

// Dashboard-related questions handler
async function handleDashboardQuestions(message, user) {
  return {
    message: `Your dashboard provides an overview of your activity. Here you can see:\n\n${
      user.role === 'student' 
      ? '• Your to-do list of pending questions\n• Quick access to courses and assignments'
      : user.role === 'teacher'
      ? '• Statistics about your courses\n• Number of students enrolled\n• Number of assignments created'
      : '• System-wide statistics\n• Total courses, teachers, and students'
    }\n\nYou can access your dashboard by clicking "Dashboard" in the left sidebar.`
  };
}

// Helper functions to classify questions
function isAboutCourses(message) {
  const courseKeywords = ['course', 'class', 'subject', 'enrolled', 'teach', 'module'];
  return courseKeywords.some(keyword => message.includes(keyword));
}

function isAboutAssignments(message) {
  const assignmentKeywords = ['assignment', 'homework', 'task', 'submit', 'due', 'deadline', 'upload'];
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

// Process guest messages (from guestChatService.js)
export async function processGuestMessage(message) {
  // Classify the message
  const topic = classifyGuestMessage(message);
  
  // If we have a predefined response for this topic, use it
  if (topic !== 'GENERAL' && ONBOARDING_TOPICS[topic]) {
    return ONBOARDING_TOPICS[topic].response;
  }
  
  // Default response for general inquiries
  return {
    message: "I can help you with learning how to use the Kangan platform. You can ask me about logging in, navigating the dashboard, accessing courses, or viewing assignments. For more detailed help, please log in and use the full AI assistant."
  };
}

// Define guest mode topics and responses
const ONBOARDING_TOPICS = {
  REGISTRATION: {
    keywords: ['register', 'sign up', 'create account', 'new account', 'join'],
    response: {
      message: "To create a new account, please contact your administrator. They will create your account with the appropriate role and provide you with login credentials."
    }
  },
  LOGIN: {
    keywords: ['login', 'sign in', 'log in', 'access account', 'password', 'email', 'username'],
    response: {
      message: "To log in:\n1. Enter your email address in the Email field\n2. Enter your password in the Password field\n3. Click the Login button\n\nIf you've forgotten your password, please contact your administrator."
    }
  },
  PROFILE_UPDATE: {
    keywords: ['update profile', 'edit profile', 'change profile', 'profile picture', 'change name', 'edit information'],
    response: {
      message: "After logging in, you can update your profile by:\n1. Clicking on your avatar in the top-right corner\n2. Selecting 'Update Profile' from the dropdown menu\n3. Updating your information in the form that appears\n4. Clicking 'Update' to save your changes"
    }
  },
  COURSES: {
    keywords: ['courses', 'available courses', 'course catalog', 'finding courses', 'view courses', 'my courses'],
    response: {
      message: "After logging in, you can access your courses by clicking on 'Courses' in the navigation menu. This will show you all courses you're enrolled in. Each course card displays the course name, description, and an image if available."
    }
  },
  // Rest of the topics from before...
  // (Include all the other topics from the previous code)
};

// Classify guest message into a topic
function classifyGuestMessage(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const [topic, data] of Object.entries(ONBOARDING_TOPICS)) {
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        return topic;
      }
    }
  }
  
  return 'GENERAL';
}