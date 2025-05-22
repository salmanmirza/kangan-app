import mongoose from 'mongoose';
const userQuestionProgressSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    completedQuestions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionBank'
    }],
    inProgressQuestions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionBank'
    }],
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });
  
   const UserQuestionProgress = mongoose.model('UserQuestionProgress', userQuestionProgressSchema);
export default UserQuestionProgress;