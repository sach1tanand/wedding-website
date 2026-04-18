const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, maxlength: 100 },
  phone:     { type: String, trim: true, maxlength: 20 },
  email:     { type: String, trim: true, lowercase: true, maxlength: 100 },
  guests:    { type: String, default: 'Just me (1)' },
  events:    { type: String, default: 'All Events' },
  meal:      { type: String, enum: ['veg','nonveg','vegan','jain'], default: 'veg' },
  message:   { type: String, trim: true, maxlength: 500 },
  attending: { type: Boolean, default: true },
  ip:        { type: String },
  createdAt: { type: Date, default: Date.now },
});

rsvpSchema.index({ createdAt: -1 });
module.exports = mongoose.model('RSVP', rsvpSchema);
