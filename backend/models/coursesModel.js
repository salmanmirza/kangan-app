const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  imgPath: {
    type: String ////img path to this field in database and actual img to selected folder in app.

  }, createdAt: {
    type: Date,
    default: Date.now

  }, updatedAt: {       ////// will be used in case of record/data iupdate 
    type: Date,
    default: undefined

  }
});

module.exports = mongoose.model('Course', courseSchema);