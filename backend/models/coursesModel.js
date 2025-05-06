import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        courseName: { type: String, required: true },
        description: { type: String, required: true },
        imgPath: { type: String },

        // References
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // One teacher
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Many students
        assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date }
    }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
