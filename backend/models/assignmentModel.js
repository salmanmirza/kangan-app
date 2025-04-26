import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true }, // Title of the assignment
        description: { type: String, required: true }, // Description of the assignment
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Link to Course
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to Teacher (creator)
        dueDate: { type: Date, required: true }, // Due date for the assignment
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date },
    }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
