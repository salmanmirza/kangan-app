const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assignmentNo: {
    type: Number,
    required: true
  },
  assignmentFile: {
    type: String,  ////to store path in database and file to folder
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: undefined
  }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
