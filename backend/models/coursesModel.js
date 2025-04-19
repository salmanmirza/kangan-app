const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  imgPath: {
    type: String ////img path to this field in database and actual img to selected folder in app.
  }
});

module.exports = mongoose.model('Course', courseSchema);