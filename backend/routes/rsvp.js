const express = require('express');
const router  = express.Router();
const RSVP    = require('../models/RSVP');
const { body, validationResult } = require('express-validator');
const { createId, isDbReady, saveState, state } = require('../store/localStore');

const validate = [
  body('name').trim().escape().notEmpty().isLength({ max: 100 }).withMessage('Name is required'),
  body('phone').optional().trim().isMobilePhone().withMessage('Invalid phone number'),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('guests').optional().trim().escape(),
  body('events').optional().trim().escape(),
  body('meal').optional().isIn(['veg','nonveg','vegan','jain']),
  body('message').optional().trim().escape().isLength({ max: 500 }),
];

// POST /api/rsvp
router.post('/', validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    if (!isDbReady()) {
      const rsvp = {
        _id: createId(),
        ...req.body,
        ip: req.ip,
        createdAt: new Date(),
      };
      state.rsvps.unshift(rsvp);
      saveState();
      return res.status(201).json({ success: true, message: 'RSVP confirmed!', rsvp });
    }

    const rsvp = await RSVP.create({
      ...req.body,
      ip: req.ip,
    });
    res.status(201).json({ success: true, message: 'RSVP confirmed! 🎉', rsvp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rsvp (admin)
router.get('/', async (req, res) => {
  try {
    if (!isDbReady()) {
      const totalGuests = state.rsvps.reduce((s, r) => s + (parseInt(r.guests, 10) || 1), 0);
      return res.json({ count: state.rsvps.length, totalGuests, rsvps: state.rsvps });
    }

    const rsvps = await RSVP.find().sort({ createdAt: -1 }).select('-ip -__v');
    const totalGuests = rsvps.reduce((s, r) => s + (parseInt(r.guests) || 1), 0);
    res.json({ count: rsvps.length, totalGuests, rsvps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
