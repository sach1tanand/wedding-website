const { Readable } = require('stream');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const { hasCloudinaryConfig } = require('../config/cloudinary');
const Image = require('../models/Image');

const allowedEvents = ['all', 'sangeet', 'haldi', 'puja', 'matkor', 'mehendi', 'wedding', 'reception'];

function uploadBufferToCloudinary(fileBuffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });

    Readable.from(fileBuffer).pipe(uploadStream);
  });
}

function toClientImage(image) {
  return {
    _id: image._id,
    imageUrl: image.imageUrl,
    url: image.imageUrl,
    thumbUrl: image.imageUrl,
    uploadedBy: image.uploadedBy,
    event: image.event,
    category: image.event,
    bytes: image.bytes,
    format: image.format,
    width: image.width,
    height: image.height,
    createdAt: image.createdAt,
  };
}

async function uploadImage(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'MongoDB is not connected. Check MONGO_URI and restart the server.' });
    }

    if (!hasCloudinaryConfig()) {
      return res.status(503).json({
        error: 'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    const event = allowedEvents.includes(req.body.event || req.body.category)
      ? req.body.event || req.body.category
      : 'all';

    const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'wedding/photos',
      resource_type: 'image',
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
    });

    const image = await Image.create({
      imageUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      uploadedBy: req.body.uploadedBy || 'Guest',
      event,
      bytes: cloudinaryResult.bytes,
      format: cloudinaryResult.format,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
    });

    return res.status(201).json({
      success: true,
      image: toClientImage(image),
      photos: [toClientImage(image)],
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return res.status(500).json({ error: 'Image upload failed. Please try again.' });
  }
}

async function uploadImages(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'MongoDB is not connected. Check MONGO_URI and restart the server.' });
    }

    if (!hasCloudinaryConfig()) {
      return res.status(503).json({
        error: 'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one image file.' });
    }

    const savedImages = [];

    for (const file of req.files) {
      const event = allowedEvents.includes(req.body.event || req.body.category)
        ? req.body.event || req.body.category
        : 'all';

      const cloudinaryResult = await uploadBufferToCloudinary(file.buffer, {
        folder: 'wedding/photos',
        resource_type: 'image',
        transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
      });

      const image = await Image.create({
        imageUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        uploadedBy: req.body.uploadedBy || 'Guest',
        event,
        bytes: cloudinaryResult.bytes,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
      });

      savedImages.push(toClientImage(image));
    }

    return res.status(201).json({
      success: true,
      count: savedImages.length,
      images: savedImages,
      photos: savedImages,
    });
  } catch (error) {
    console.error('Images upload failed:', error);
    return res.status(500).json({ error: 'Image upload failed. Please try again.' });
  }
}

async function getImages(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ total: 0, images: [], photos: [] });
    }

    const { event, category } = req.query;
    const selectedEvent = event || category;
    const filter = {};

    if (selectedEvent && selectedEvent !== 'all') {
      filter.event = selectedEvent;
    }

    const images = await Image.find(filter).sort({ createdAt: -1 });
    const mappedImages = images.map(toClientImage);

    return res.json({
      total: mappedImages.length,
      images: mappedImages,
      photos: mappedImages,
    });
  } catch (error) {
    console.error('Fetching images failed:', error);
    return res.status(500).json({ error: 'Could not fetch images.' });
  }
}

module.exports = {
  getImages,
  uploadImage,
  uploadImages,
};
