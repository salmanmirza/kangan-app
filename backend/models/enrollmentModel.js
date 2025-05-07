import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to Student
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Reference to Course
        enrollmentDate: { type: Date, default: Date.now },
        status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' } // Track enrollment status
    }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
