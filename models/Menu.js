const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    required: true
  },
  items: [{
    type: String,
    required: true
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Menu', MenuItemSchema);