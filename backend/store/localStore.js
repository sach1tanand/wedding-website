const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'local-db.json');

const defaultState = {
  photos: [],
  rsvps: [],
  videos: [],
  wishes: [
    {
      _id: crypto.randomUUID(),
      name: 'Family Blessings',
      message: 'Wishing Deepak and Awantika a joyful married life filled with love and togetherness.',
      approved: true,
      createdAt: new Date(),
    },
  ],
};

fs.mkdirSync(dataDir, { recursive: true });

const state = fs.existsSync(dataFile)
  ? { ...defaultState, ...JSON.parse(fs.readFileSync(dataFile, 'utf8')) }
  : defaultState;

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function createId() {
  return crypto.randomUUID();
}

function saveState() {
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
}

module.exports = {
  createId,
  isDbReady,
  saveState,
  state,
};
