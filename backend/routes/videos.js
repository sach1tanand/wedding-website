const express = require('express');
const Video = require('../models/Video');
const { createId, isDbReady, saveState, state } = require('../store/localStore');

const router = express.Router();

function toEmbedUrl(url) {
  const driveMatch = String(url).match(/\/d\/([a-zA-Z0-9_-]+)/) || String(url).match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  if (/youtube\.com|youtu\.be/.test(url)) return url;
  return url;
}

function filterByCategory(items, category) {
  if (!category || category === 'all') return items;
  return items.filter((item) => item.category === category);
}

router.post('/', async (req, res) => {
  try {
    const { driveUrl, title, uploadedBy, category } = req.body;
    if (!driveUrl || !/^https?:\/\//i.test(driveUrl)) {
      return res.status(400).json({ error: 'Please paste a valid video link' });
    }

    const video = {
      _id: createId(),
      driveUrl,
      embedUrl: toEmbedUrl(driveUrl),
      title: title || 'Wedding Video',
      uploadedBy: uploadedBy || 'Guest',
      category: category || 'all',
      likes: 0,
      approved: true,
      createdAt: new Date(),
    };

    if (isDbReady()) {
      const dbVideo = await Video.create(video);
      return res.status(201).json({ success: true, video: dbVideo });
    }

    state.videos.unshift(video);
    saveState();
    return res.status(201).json({ success: true, video });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    if (!isDbReady()) {
      const videos = filterByCategory(state.videos, category);
      return res.json({ total: videos.length, page: Number(page), videos });
    }

    const filter = { approved: true };
    if (category && category !== 'all') filter.category = category;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Video.countDocuments(filter);
    const videos = await Video.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).select('-__v');
    return res.json({ total, page: parseInt(page, 10), videos });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    if (!isDbReady()) {
      const video = state.videos.find((item) => item._id === req.params.id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      video.likes += 1;
      saveState();
      return res.json({ success: true, likes: video.likes });
    }

    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    return res.json({ success: true, likes: video.likes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
