const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Add expense (Admin only)
router.post('/add', async (req, res) => {
  try {
    const { category, amount, description, recordedBy } = req.body;
    
    const expense = new Expense({
      category,
      amount,
      description,
      recordedBy
    });
    
    await expense.save();
    res.json({ 
      success: true, 
      message: 'Expense added successfully',
      data: expense 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all expenses (Admin only)
router.get('/all', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json({ 
      success: true, 
      data: expenses 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update expense
router.put('/update/:id', async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ 
      success: true, 
      message: 'Expense updated successfully',
      data: updatedExpense 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete expense
router.delete('/delete/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Expense deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get expenses summary
router.get('/summary', async (req, res) => {
  try {
    const expenses = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);
    
    const total = await Expense.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    
    res.json({ 
      success: true, 
      data: {
        byCategory: expenses,
        total: total[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;