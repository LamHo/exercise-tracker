const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: false},
  userId: { type: String, required: true }
});

module.exports = mongoose.model('exercise', exerciseSchema);