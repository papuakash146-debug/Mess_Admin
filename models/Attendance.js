const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    required: true
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);