import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        courseName: { type: String, required: true },
        description: { type: String, required: true },
        imgPath: { type: String }, // Optional image path
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to Teacher
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date }
    }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
