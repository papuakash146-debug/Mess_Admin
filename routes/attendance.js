const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Mark attendance (Admin only)
router.post('/mark', async (req, res) => {
  try {
    const { studentName, className, roomNumber, status, mealType } = req.body;
    
    const attendance = new Attendance({
      studentName,
      className,
      roomNumber,
      status,
      mealType,
      date: new Date()
    });
    
    await attendance.save();
    res.json({ 
      success: true, 
      message: 'Attendance marked successfully',
      data: attendance 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all attendance records
router.get('/all', async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });
    res.json({ 
      success: true, 
      data: attendance 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get attendance by date
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const attendance = await Attendance.find({
      date: {
        $gte: date,
        $lt: nextDate
      }
    });
    
    res.json({ 
      success: true, 
      data: attendance 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get attendance by student name
router.get('/student/:name', async (req, res) => {
  try {
    const attendance = await Attendance.find({ 
      studentName: new RegExp(req.params.name, 'i') 
    }).sort({ date: -1 });
    
    res.json({ 
      success: true, 
      data: attendance 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;