const express = require('express');
const router  = express.Router();
const Wish    = require('../models/Wish');
const { body, validationResult } = require('express-validator');
const { createId, isDbReady, saveState, state } = require('../store/localStore');

const validate = [
  body('name').trim().escape().notEmpty().isLength({ max: 100 }),
  body('message').trim().escape().notEmpty().isLength({ max: 1000 }),
];

router.post('/', validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    if (!isDbReady()) {
      const wish = {
        _id: createId(),
        ...req.body,
        approved: true,
        createdAt: new Date(),
      };
      state.wishes.unshift(wish);
      saveState();
      return res.status(201).json({ success: true, wish });
    }

    const wish = await Wish.create(req.body);
    res.status(201).json({ success: true, wish });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    if (!isDbReady()) {
      const wishes = state.wishes.filter((wish) => wish.approved);
      return res.json({ count: wishes.length, wishes });
    }

    const wishes = await Wish.find({ approved: true }).sort({ createdAt: -1 }).select('-__v');
    res.json({ count: wishes.length, wishes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!isDbReady()) {
      state.wishes = state.wishes.filter((wish) => wish._id !== req.params.id);
      saveState();
      return res.json({ success: true });
    }

    await Wish.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
