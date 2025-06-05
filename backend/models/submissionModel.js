import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileUrl: { type: String },
    textResponse: { type: String },
    comment: { type: String },
    submittedAt: { type: Date, default: Date.now }
  });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
