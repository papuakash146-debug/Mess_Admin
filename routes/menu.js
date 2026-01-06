const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// Add menu item (Admin only)
router.post('/add', async (req, res) => {
  try {
    const { day, mealType, items } = req.body;
    
    const menuItem = new Menu({
      day,
      mealType,
      items
    });
    
    await menuItem.save();
    res.json({ 
      success: true, 
      message: 'Menu added successfully',
      data: menuItem 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all menu items
router.get('/all', async (req, res) => {
  try {
    const menuItems = await Menu.find().sort({ day: 1 });
    res.json({ 
      success: true, 
      data: menuItems 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get menu by day
router.get('/day/:day', async (req, res) => {
  try {
    const menuItems = await Menu.find({ day: req.params.day });
    res.json({ 
      success: true, 
      data: menuItems 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update menu item
router.put('/update/:id', async (req, res) => {
  try {
    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ 
      success: true, 
      message: 'Menu updated successfully',
      data: updatedMenu 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete menu item
router.delete('/delete/:id', async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Menu deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;