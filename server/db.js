const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMockMode = false;

// Connect to MongoDB if MONGO_URI is present
async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('🌸 MONGO_URI not found. Starting in Local File Database (Mock) Mode! 🌸');
    isMockMode = true;
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('🌸 MongoDB Connected Successfully! 🌸');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    console.log('🌸 Falling back to Local File Database (Mock) Mode! 🌸');
    isMockMode = true;
  }
}

// Helper to read JSON file
function readJson(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to write JSON file
function writeJson(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Generates a mock ObjectId
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Mock Model wrapper
class MockModel {
  constructor(filename) {
    this.filename = filename;
  }

  find(query = {}) {
    const items = readJson(this.filename);
    return items.filter(item => {
      for (let key in query) {
        if (query[key] !== item[key]) return false;
      }
      return true;
    });
  }

  findOne(query = {}) {
    const items = this.find(query);
    return items.length > 0 ? items[0] : null;
  }

  findById(id) {
    const items = readJson(this.filename);
    return items.find(item => item._id === id) || null;
  }

  create(data) {
    const items = readJson(this.filename);
    const newItem = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    writeJson(this.filename, items);
    return newItem;
  }

  findByIdAndUpdate(id, updates, options = { new: true }) {
    const items = readJson(this.filename);
    const idx = items.findIndex(item => item._id === id);
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeJson(this.filename, items);
    return items[idx];
  }

  findByIdAndDelete(id) {
    const items = readJson(this.filename);
    const item = items.find(i => i._id === id);
    const filtered = items.filter(i => i._id !== id);
    writeJson(this.filename, filtered);
    return item;
  }

  deleteMany(query = {}) {
    const items = readJson(this.filename);
    const beforeCount = items.length;
    const filtered = items.filter(item => {
      for (let key in query) {
        if (query[key] === item[key]) return false;
      }
      return true;
    });
    writeJson(this.filename, filtered);
    return { deletedCount: beforeCount - filtered.length };
  }
}

// Import real Mongoose Models
const User = require('./models/User');
const Relationship = require('./models/Relationship');
const Message = require('./models/Message');
const Note = require('./models/Note');
const Planner = require('./models/Planner');
const Memory = require('./models/Memory');

const mockDbs = {
  users: new MockModel('users.json'),
  relationships: new MockModel('relationships.json'),
  messages: new MockModel('messages.json'),
  notes: new MockModel('notes.json'),
  planner: new MockModel('planner.json'),
  memories: new MockModel('memories.json'),
};

module.exports = {
  connectDB,
  getIsMock: () => isMockMode,

  // User Actions
  users: {
    find: async (query) => isMockMode ? mockDbs.users.find(query) : User.find(query),
    findOne: async (query) => isMockMode ? mockDbs.users.findOne(query) : User.findOne(query),
    findById: async (id) => isMockMode ? mockDbs.users.findById(id) : User.findById(id),
    create: async (data) => isMockMode ? mockDbs.users.create(data) : User.create(data),
    findByIdAndUpdate: async (id, updates) => isMockMode ? mockDbs.users.findByIdAndUpdate(id, updates) : User.findByIdAndUpdate(id, updates, { new: true }),
    countDocuments: async () => isMockMode ? mockDbs.users.find().length : User.countDocuments()
  },

  // Relationship Actions
  relationships: {
    findOne: async (query) => isMockMode ? mockDbs.relationships.findOne(query) : Relationship.findOne(query),
    findById: async (id) => isMockMode ? mockDbs.relationships.findById(id) : Relationship.findById(id),
    create: async (data) => isMockMode ? mockDbs.relationships.create(data) : Relationship.create(data),
    findByIdAndUpdate: async (id, updates) => isMockMode ? mockDbs.relationships.findByIdAndUpdate(id, updates) : Relationship.findByIdAndUpdate(id, updates, { new: true }),
  },

  // Message Actions
  messages: {
    find: async (query) => isMockMode ? mockDbs.messages.find(query) : Message.find(query),
    create: async (data) => isMockMode ? mockDbs.messages.create(data) : Message.create(data),
    findByIdAndUpdate: async (id, updates) => isMockMode ? mockDbs.messages.findByIdAndUpdate(id, updates) : Message.findByIdAndUpdate(id, updates, { new: true }),
    findByIdAndDelete: async (id) => isMockMode ? mockDbs.messages.findByIdAndDelete(id) : Message.findByIdAndDelete(id),
  },

  // Note Actions
  notes: {
    find: async (query) => isMockMode ? mockDbs.notes.find(query) : Note.find(query),
    create: async (data) => isMockMode ? mockDbs.notes.create(data) : Note.create(data),
    findByIdAndUpdate: async (id, updates) => isMockMode ? mockDbs.notes.findByIdAndUpdate(id, updates) : Note.findByIdAndUpdate(id, updates, { new: true }),
    findByIdAndDelete: async (id) => isMockMode ? mockDbs.notes.findByIdAndDelete(id) : Note.findByIdAndDelete(id),
  },

  // Planner Actions
  planner: {
    find: async (query) => isMockMode ? mockDbs.planner.find(query) : Planner.find(query),
    create: async (data) => isMockMode ? mockDbs.planner.create(data) : Planner.create(data),
    findByIdAndUpdate: async (id, updates) => isMockMode ? mockDbs.planner.findByIdAndUpdate(id, updates) : Planner.findByIdAndUpdate(id, updates, { new: true }),
    findByIdAndDelete: async (id) => isMockMode ? mockDbs.planner.findByIdAndDelete(id) : Planner.findByIdAndDelete(id),
  },

  // Memory Actions
  memories: {
    find: async (query) => isMockMode ? mockDbs.memories.find(query) : Memory.find(query),
    create: async (data) => isMockMode ? mockDbs.memories.create(data) : Memory.create(data),
    findByIdAndUpdate: async (id, updates) => isMockMode ? mockDbs.memories.findByIdAndUpdate(id, updates) : Memory.findByIdAndUpdate(id, updates, { new: true }),
    findByIdAndDelete: async (id) => isMockMode ? mockDbs.memories.findByIdAndDelete(id) : Memory.findByIdAndDelete(id),
  }
};
