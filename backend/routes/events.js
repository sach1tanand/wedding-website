const express = require('express');
const router = express.Router();

const EVENTS = [
  { id: 1, name: 'Sangeet Ceremony', icon: 'S', date: '2026-04-27', time: '9:00 AM', venue: 'Sarmastpur, Muzaffarpur', dress: 'Festive traditional' },
  { id: 2, name: 'Haldi Ceremony', icon: 'H', date: '2026-04-28', time: 'Morning', venue: 'Pirnagar, Begusarai, Bihar', dress: 'Yellow or light festive wear' },
  { id: 3, name: 'Satyanarayan Puja', icon: 'P', date: '2026-04-28', time: 'Daytime', venue: 'Pirnagar, Begusarai, Bihar', dress: 'Traditional attire' },
  { id: 4, name: 'Gidhari / Matkor', icon: 'M', date: '2026-04-28', time: 'Evening', venue: 'Pirnagar, Begusarai, Bihar', dress: 'Traditional attire' },
  { id: 5, name: 'Wedding Ceremony', icon: 'W', date: '2026-04-29', time: '6:00 PM', venue: 'Pirnagar, Begusarai, Bihar', dress: 'Wedding attire' },
];

router.get('/', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.json({ events: EVENTS.map((event) => ({ ...event, isToday: event.date === today })) });
});

module.exports = router;
