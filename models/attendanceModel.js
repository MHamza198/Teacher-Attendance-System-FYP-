const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  course_name: {
    type: String,
    required: true,
  },
  course_code: {
    type: String,
    required: true,
  },
  degree_name: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true,
  },
  attendance: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true,
  },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
