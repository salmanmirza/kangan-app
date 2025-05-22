import mongoose from 'mongoose';
  
const questionBankSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);  
export default QuestionBank;