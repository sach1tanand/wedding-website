const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const RSVP    = require('../models/RSVP');
const Wish    = require('../models/Wish');
const Image   = require('../models/Image');
const Video   = require('../models/Video');
const cloudinary = require('../config/cloudinary');
const { isDbReady, saveState, state } = require('../store/localStore');

// ── AUTH MIDDLEWARE ──
function authAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  try {
    jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'local-dev-secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== (process.env.ADMIN_PASSWORD || 'admin123'))
    return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'local-dev-secret', { expiresIn: '8h' });
  res.json({ success: true, token, expiresIn: '8h' });
});

// GET /api/admin/stats
router.get('/stats', authAdmin, async (req, res) => {
  try {
    if (!isDbReady()) {
      const totalGuests = state.rsvps.reduce((s, r) => s + (parseInt(r.guests, 10) || 1), 0);
      return res.json({
        rsvpCount: state.rsvps.length,
        wishCount: state.wishes.filter((wish) => wish.approved).length,
        photoCount: 0,
        videoCount: 0,
        totalGuests,
        storageUsed: null,
      });
    }

    const [rsvpCount, wishCount, photoCount, videoCount, rsvps] = await Promise.all([
      RSVP.countDocuments(),
      Wish.countDocuments({ approved: true }),
      Image.countDocuments(),
      Video.countDocuments({ approved: true }),
      RSVP.find().select('guests'),
    ]);
    const totalGuests = rsvps.reduce((s, r) => s + (parseInt(r.guests) || 1), 0);

    // Cloudinary storage usage
    let storageUsed = null;
    try {
      const usage = await cloudinary.api.usage();
      storageUsed = {
        usedGB: (usage.storage.usage / 1024 / 1024 / 1024).toFixed(2),
        limitGB: (usage.storage.limit  / 1024 / 1024 / 1024).toFixed(2),
        percent: ((usage.storage.usage / usage.storage.limit) * 100).toFixed(1),
      };
    } catch { /* Cloudinary not configured */ }

    res.json({ rsvpCount, wishCount, photoCount, videoCount, totalGuests, storageUsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/rsvps
router.get('/rsvps', authAdmin, async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ count: state.rsvps.length, rsvps: state.rsvps });
    }

    const rsvps = await RSVP.find().sort({ createdAt: -1 }).select('-ip -__v');
    res.json({ count: rsvps.length, rsvps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/wishes
router.get('/wishes', authAdmin, async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ count: state.wishes.length, wishes: state.wishes });
    }

    const wishes = await Wish.find().sort({ createdAt: -1 });
    res.json({ count: wishes.length, wishes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/photos/:id
router.delete('/photos/:id', authAdmin, async (req, res) => {
  try {
    const photo = await Image.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Only delete from Cloudinary if publicId exists
    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId);
    }

    await photo.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/videos/:id
router.delete('/videos/:id', authAdmin, async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/wishes/:id/toggle — approve/unapprove
router.put('/wishes/:id/toggle', authAdmin, async (req, res) => {
  try {
    if (!isDbReady()) {
      const wish = state.wishes.find((item) => item._id === req.params.id);
      if (!wish) return res.status(404).json({ error: 'Not found' });
      wish.approved = !wish.approved;
      saveState();
      return res.json({ success: true, approved: wish.approved });
    }

    const wish = await Wish.findById(req.params.id);
    if (!wish) return res.status(404).json({ error: 'Not found' });
    wish.approved = !wish.approved;
    await wish.save();
    res.json({ success: true, approved: wish.approved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
