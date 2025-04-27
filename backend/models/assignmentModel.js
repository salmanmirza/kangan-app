import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: true, 
            trim: true // To remove any unnecessary spaces in the title
        },
        description: { 
            type: String, 
            required: true, 
            trim: true // To remove any unnecessary spaces in the description
        },
        course: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Course', // Assuming 'Course' is another model for the course 
            required: true 
        },
        teacher: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', // Assuming 'User' is the teacher's model
            required: true 
        },
        assignmentNo: {
            type: String, 
            required: true
        },
        dueDate: { 
            type: Date, 
            required: true 
        },
        assignmentFile: { 
            type: String, 
            required: false, // Optional, as the file may not always be uploaded
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
        updatedAt: { 
            type: Date, 
            default: Date.now 
        },
    }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
