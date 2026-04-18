const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  publicId:   { type: String, required: true },   // Cloudinary public_id
  url:        { type: String, required: true },   // Cloudinary secure_url
  thumbUrl:   { type: String },                   // Cloudinary thumbnail
  width:      { type: Number },
  height:     { type: Number },
  format:     { type: String },
  bytes:      { type: Number },
  category:   { type: String, enum: ['haldi','mehendi','sangeet','wedding','reception','all'], default: 'all' },
  uploadedBy: { type: String, default: 'Guest', maxlength: 100 },
  likes:      { type: Number, default: 0 },
  approved:   { type: Boolean, default: true },
  createdAt:  { type: Date, default: Date.now },
});

photoSchema.index({ category: 1, createdAt: -1 });
module.exports = mongoose.model('Photo', photoSchema);
