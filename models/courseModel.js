const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  degree_name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Degree',
    required: true
  },
  course_code: {
    type: String,
    required: true
  },
  course_name: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
