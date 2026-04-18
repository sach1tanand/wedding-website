const express = require('express');
const multer = require('multer');
const { getImages, uploadImage, uploadImages } = require('../controllers/imageController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }

    return cb(new Error('Only image files are allowed.'));
  },
});

router.post('/upload', upload.single('image'), uploadImage);
router.post('/gallery/upload', upload.array('photos', 20), uploadImages);
router.get('/images', getImages);
router.get('/gallery', getImages);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  if (err) {
    return res.status(400).json({ error: err.message });
  }

  return next();
});

module.exports = router;
