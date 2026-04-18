const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Photo = require('../models/Photo');
const { createId, isDbReady, saveState, state } = require('../store/localStore');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads', 'photos');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${createId()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) return cb(null, true);
    return cb(new Error('Only image files are allowed'));
  },
});

function filterByCategory(items, category) {
  if (!category || category === 'all') return items;
  return items.filter((item) => item.category === category);
}

router.post('/upload', upload.array('photos', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const category = req.body.category || 'all';
    const uploadedBy = req.body.uploadedBy || 'Guest';
    const saved = req.files.map((file) => ({
      _id: createId(),
      publicId: file.filename,
      url: `/uploads/photos/${file.filename}`,
      thumbUrl: `/uploads/photos/${file.filename}`,
      bytes: file.size,
      category,
      uploadedBy,
      likes: 0,
      approved: true,
      createdAt: new Date(),
    }));

    if (isDbReady()) {
      const dbSaved = await Photo.insertMany(saved);
      return res.status(201).json({ success: true, count: dbSaved.length, photos: dbSaved });
    }

    state.photos.unshift(...saved);
    saveState();
    return res.status(201).json({ success: true, count: saved.length, photos: saved });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 30 } = req.query;

    if (!isDbReady()) {
      const photos = filterByCategory(state.photos, category);
      return res.json({ total: photos.length, page: Number(page), pages: 1, photos });
    }

    const filter = { approved: true };
    if (category && category !== 'all') filter.category = category;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Photo.countDocuments(filter);
    const photos = await Photo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).select('-__v');
    return res.json({ total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)), photos });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    if (!isDbReady()) {
      const photo = state.photos.find((item) => item._id === req.params.id);
      if (!photo) return res.status(404).json({ error: 'Photo not found' });
      photo.likes += 1;
      saveState();
      return res.json({ success: true, likes: photo.likes });
    }

    const photo = await Photo.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    return res.json({ success: true, likes: photo.likes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
