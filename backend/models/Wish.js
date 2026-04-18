const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, maxlength: 100 },
  message:   { type: String, required: true, trim: true, maxlength: 1000 },
  approved:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

wishSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Wish', wishSchema);
