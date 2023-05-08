const mongoose = require('mongoose');

const degreeSchema = new mongoose.Schema({
  degree_name: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  }
}, { timestamps: true });

const Degree = mongoose.model('Degree', degreeSchema);

module.exports = Degree;
