import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
        department: { type: String }, // Only applicable for teachers
        qualification: { type: String }, // Only applicable for teachers
        studentRollNo: { type: String }, // Only applicable for students
        studentGuardian: { type: String }, // Only applicable for students
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date }
    }
);

const User = mongoose.model('User', userSchema);

export default User;
