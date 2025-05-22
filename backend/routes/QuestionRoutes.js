// Updated questions.js route file to fix the 'courseId[]' parameter issue

import express from 'express';
import mongoose from 'mongoose';
import QuestionBank from '../models/QuestionBank.js';
import UserQuestionProgress from '../models/UserQuestionProgress.js';

const router = express.Router();

router.get('/questions', async (req, res) => {
  console.log('Request query:', req.query);
  
  const userId = req.query.userId;
  
  // Correctly handle 'courseId[]' parameter
  let courseIds = [];
  if (req.query['courseId[]']) {
    // Handle both array and single value
    courseIds = Array.isArray(req.query['courseId[]']) 
      ? req.query['courseId[]'] 
      : [req.query['courseId[]']];
  }
  
  console.log('userId:', userId);
  console.log('courseIds:', courseIds);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  if (courseIds.length === 0) {
    return res.status(400).json({ error: 'At least one courseId is required' });
  }

  try {
    let allInProgressQuestions = [];
    let allCompletedQuestionIds = new Set();

    for (const course of courseIds) {
      // Ensure courseId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(course)) {
        console.log(`Invalid courseId: ${course}`);
        continue; // Skip invalid IDs
      }

      const courseObjectId = new mongoose.Types.ObjectId(course);
      console.log('Processing course:', courseObjectId);

      let progress = await UserQuestionProgress.findOne({ 
        user: userId, 
        course: courseObjectId 
      });
      console.log('Found progress:', progress ? 'yes' : 'no');

      // If no progress OR progress exists but has no questions → seed 5 questions
      if (!progress || !progress.inProgressQuestions || progress.inProgressQuestions.length === 0) {
        console.log('Seeding questions for course:', courseObjectId);
        
        const firstFive = await QuestionBank.find({ course: courseObjectId }).limit(5);
        console.log('Found questions to seed:', firstFive.length);

        if (!progress) {
          // Create new progress record
          progress = await UserQuestionProgress.create({
            user: userId,
            course: courseObjectId,
            inProgressQuestions: firstFive.map(q => q._id),
            completedQuestions: []
          });
          console.log('Created new progress');
        } else {
          // Update existing progress
          progress.inProgressQuestions = firstFive.map(q => q._id);
          await progress.save();
          console.log('Updated existing progress');
        }
      }

      // Store completed questions
      if (progress.completedQuestions && progress.completedQuestions.length > 0) {
        progress.completedQuestions.forEach(id => {
          allCompletedQuestionIds.add(id.toString());
        });
      }

      // Populate question data
      try {
        await progress.populate('inProgressQuestions');
        console.log('Populated questions:', progress.inProgressQuestions.length);
        
        allInProgressQuestions = allInProgressQuestions.concat(progress.inProgressQuestions);
      } catch (populateErr) {
        console.error('Error populating questions:', populateErr);
      }
    }

    // Remove duplicate questions
    const uniqueMap = new Map();
    allInProgressQuestions.forEach(q => {
      if (q && q._id) {
        uniqueMap.set(q._id.toString(), q);
      }
    });
    const uniqueQuestions = Array.from(uniqueMap.values());
    console.log('Total unique questions:', uniqueQuestions.length);

    // Format response
    const formattedQuestions = uniqueQuestions.map(q => ({
      id: q._id,
      text: q.questionText,
      completed: allCompletedQuestionIds.has(q._id.toString())
    }));

    return res.json({
      questions: formattedQuestions,
      completedIds: Array.from(allCompletedQuestionIds)
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Add the completion endpoint
router.post('/complete', async (req, res) => {
  const { userId, courseId, questionId } = req.body;
  
  console.log('Complete request:', { userId, courseId, questionId });
  
  if (!userId || !questionId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Determine the course ID
    let courseObjectId;
    
    // Handle courseId[] format if needed
    let courseIdValue = courseId;
    if (courseId && courseId['0']) {
      courseIdValue = courseId['0']; // Access first element if it's an object with numeric keys
    }
    
    if (Array.isArray(courseIdValue) && courseIdValue.length > 0) {
      // Find which course this question belongs to
      const question = await QuestionBank.findById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      courseObjectId = question.course;
    } else if (courseIdValue) {
      courseObjectId = new mongoose.Types.ObjectId(courseIdValue);
    } else {
      // If no courseId is provided, find the question to get its course
      const question = await QuestionBank.findById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      courseObjectId = question.course;
    }
    
    console.log('Using course:', courseObjectId);
    
    // Update the progress
    const result = await UserQuestionProgress.findOneAndUpdate(
      { user: userId, course: courseObjectId },
      { 
        $addToSet: { completedQuestions: questionId },
        $pull: { inProgressQuestions: questionId }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Progress record not found' });
    }
    
    console.log('Question marked as complete');
    
    res.json({ 
      success: true, 
      message: 'Question marked as complete' 
    });
  } catch (error) {
    console.error('Error completing question:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;