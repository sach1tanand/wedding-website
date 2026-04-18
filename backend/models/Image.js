const mongoose = require('mongoose');

const allowedEvents = ['all', 'sangeet', 'haldi', 'puja', 'matkor', 'mehendi', 'wedding', 'reception'];

const imageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'Guest',
    },
    event: {
      type: String,
      enum: allowedEvents,
      default: 'all',
      index: true,
    },
    bytes: Number,
    format: String,
    width: Number,
    height: Number,
  },
  { timestamps: true }
);

imageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Image', imageSchema);
