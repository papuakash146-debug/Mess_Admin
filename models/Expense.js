const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Cleaning', 'Utensils', 'Miscellaneous']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  recordedBy: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);