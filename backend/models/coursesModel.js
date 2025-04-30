import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        courseName: { type: String, required: true },
        description: { type: String, required: true },
        imgPath: { type: String }, // Optional image path
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date }
    }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
