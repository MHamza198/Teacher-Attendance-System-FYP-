const mongoose = require('mongoose');

const allocateCourseSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  degree_name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Degree',
    required: true
  },
  course_code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  course_name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  }
}, { timestamps: true });

const AllocateCourse = mongoose.model('AllocateCourse', allocateCourseSchema);

module.exports = AllocateCourse;
