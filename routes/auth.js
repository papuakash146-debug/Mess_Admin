const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check credentials based on role
    if (role === 'admin') {
      if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        return res.json({ 
          success: true, 
          role: 'admin',
          username: username
        });
      }
    } else if (role === 'student') {
      if (username === process.env.STUDENT_USERNAME && password === process.env.STUDENT_PASSWORD) {
        return res.json({ 
          success: true, 
          role: 'student',
          username: username
        });
      }
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;