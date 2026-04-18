const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title:       { type: String, trim: true, maxlength: 200, default: 'Wedding Video' },
  driveUrl:    { type: String, required: true },   // Google Drive share link
  embedUrl:    { type: String },                   // Converted embed URL
  thumbnail:   { type: String },                   // Optional thumbnail URL
  uploadedBy:  { type: String, default: 'Guest', maxlength: 100 },
  category:    { type: String, enum: ['haldi','mehendi','sangeet','wedding','reception','all'], default: 'all' },
  likes:       { type: Number, default: 0 },
  approved:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
});

videoSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Video', videoSchema);
