const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    await seedDatabase();
    return;
  }

  try {
    await mongoose.connect(mongoUri, { dbName: 'shinoraa' });
    console.log('🌸 MongoDB Connected Successfully! 🌸');
    await seedDatabase();
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    console.log('🌸 Falling back to Local File Database (Mock) Mode! 🌸');
    isMockMode = true;
    await seedDatabase();
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

// Seed the database with two default users (BubbleBee style)
async function seedDatabase() {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('love123', salt);

    if (isMockMode) {
      const users = readJson('users.json');
      if (users.length === 0) {
        console.log('🌸 Seeding 2 default users into Local File Database... 🌸');
        
        const relId = 'relationship-seed-1337';
        const partner1Id = 'user-haru-111';
        const partner2Id = 'user-sakura-222';

        // Seed Relationship
        const relationship = {
          _id: relId,
          partner1: partner1Id,
          partner2: partner2Id,
          inviteCode: 'SAKURA-LOVE',
          startDate: '2025-02-14T00:00:00.000Z', // 1 Year+ Anniversary counter
          dailyStreak: 124,
          lastActive: new Date().toISOString(),
          loveQuotes: [
            "In all the world, there is no heart for me like yours. 🌸",
            "You make my heart bloom like a cherry blossom in spring. ❤️",
            "Together is my favorite place to be."
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        writeJson('relationships.json', [relationship]);

        // Seed Users
        const user1 = {
          _id: partner1Id,
          username: 'haru',
          email: 'haru@sakura.com',
          passwordHash,
          relationshipId: relId,
          profile: {
            nickname: 'Haru 🦊',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=haru',
            banner: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&auto=format&fit=crop',
            bio: 'Watching anime with you is my favorite thing.',
            favAnime: 'Spirited Away',
            favColor: 'Sky Blue',
            favFood: 'Ramen 🍜',
            birthday: 'April 10',
            location: 'Happy 🌸'
          },
          badges: ['Sakura Seed 🌸', 'Memory Maker 📸'],
          achievements: ['Welcome Home ❤️', 'First Memory Saved 🌸'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const user2 = {
          _id: partner2Id,
          username: 'sakura',
          email: 'sakura@sakura.com',
          passwordHash,
          relationshipId: relId,
          profile: {
            nickname: 'Sakura 🌸',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cherry',
            banner: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&auto=format&fit=crop',
            bio: 'Matcha dates under the cherry blossoms is all I need.',
            favAnime: 'Your Name',
            favColor: 'Sakura Pink',
            favFood: 'Sushi 🍣',
            birthday: 'November 14',
            location: 'Loved ❤️'
          },
          badges: ['Sakura Seed 🌸', 'Sakura Star ✨'],
          achievements: ['Welcome Home ❤️', 'Profile Customized 🎀'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        writeJson('users.json', [user1, user2]);

        // Seed Notes (Sticky notes)
        const notes = [
          {
            _id: 'note-1',
            relationshipId: relId,
            sender: 'haru',
            type: 'sticky',
            content: 'Don\'t forget to buy strawberry pocky! 🍓',
            color: '#FFC1CC',
            pinned: false,
            createdAt: new Date().toISOString()
          },
          {
            _id: 'note-2',
            relationshipId: relId,
            sender: 'sakura',
            type: 'sticky',
            content: 'I love you to the moon and back 🌙',
            color: '#E6E6FA',
            pinned: false,
            createdAt: new Date().toISOString()
          }
        ];
        writeJson('notes.json', notes);

        // Seed Memories
        const memories = [
          {
            _id: 'mem-1',
            relationshipId: relId,
            title: 'Our First Picnic 🌸',
            description: 'Sitting under the cherry blossoms sharing sandwiches.',
            mediaUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop',
            mediaType: 'image',
            date: '2025-04-10',
            category: 'Cozy Dates',
            isFavorite: true,
            createdAt: new Date().toISOString()
          },
          {
            _id: 'mem-2',
            relationshipId: relId,
            title: 'Cozy Cafe Escape ☕',
            description: 'Escaped the rain to drink warm matcha tea.',
            mediaUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop',
            mediaType: 'image',
            date: '2025-10-15',
            category: 'Cozy Dates',
            isFavorite: false,
            createdAt: new Date().toISOString()
          }
        ];
        writeJson('memories.json', memories);

        // Seed Planner
        const planner = [
          {
            _id: 'plan-1',
            relationshipId: relId,
            type: 'task',
            title: 'Plan next movie night 🍿',
            description: 'Decide between anime films!',
            completed: false,
            assignee: 'haru',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'plan-2',
            relationshipId: relId,
            type: 'shopping',
            title: 'Matcha green tea powder 🍵',
            description: 'For baking cookies',
            completed: true,
            createdAt: new Date().toISOString()
          },
          {
            _id: 'plan-3',
            relationshipId: relId,
            type: 'calendar_event',
            title: 'Our Anniversary Dinner 🎉',
            description: 'Table booked at Tokyo Garden.',
            dueDate: '2026-02-14',
            createdAt: new Date().toISOString()
          }
        ];
        writeJson('planner.json', planner);

        console.log('🌸 Seed completed! Log in using "haru@sakura.com" or "sakura@sakura.com" with password "love123" 🌸');
      }
    } else {
      // Mongoose DB Seeding
      const User = require('./models/User');
      const Relationship = require('./models/Relationship');
      const Note = require('./models/Note');
      const Memory = require('./models/Memory');
      const Planner = require('./models/Planner');

      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌸 Seeding 2 default users into MongoDB Atlas... 🌸');

        // Create relationship
        const rel = await Relationship.create({
          partner1: new mongoose.Types.ObjectId(), // placeholder
          partner2: new mongoose.Types.ObjectId(), // placeholder
          inviteCode: 'SAKURA-LOVE',
          startDate: new Date('2025-02-14'),
          dailyStreak: 124,
          loveQuotes: [
            "In all the world, there is no heart for me like yours. 🌸",
            "You make my heart bloom like a cherry blossom in spring. ❤️",
            "Together is my favorite place to be."
          ]
        });

        // Create users
        const user1 = await User.create({
          _id: rel.partner1,
          username: 'haru',
          email: 'haru@sakura.com',
          passwordHash,
          relationshipId: rel._id.toString(),
          profile: {
            nickname: 'Haru 🦊',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=haru',
            banner: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&auto=format&fit=crop',
            bio: 'Watching anime with you is my favorite thing.',
            favAnime: 'Spirited Away',
            favColor: 'Sky Blue',
            favFood: 'Ramen 🍜',
            birthday: 'April 10',
            location: 'Happy 🌸'
          },
          badges: ['Sakura Seed 🌸', 'Memory Maker 📸'],
          achievements: ['Welcome Home ❤️', 'First Memory Saved 🌸']
        });

        const user2 = await User.create({
          _id: rel.partner2,
          username: 'sakura',
          email: 'sakura@sakura.com',
          passwordHash,
          relationshipId: rel._id.toString(),
          profile: {
            nickname: 'Sakura 🌸',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cherry',
            banner: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&auto=format&fit=crop',
            bio: 'Matcha dates under the cherry blossoms is all I need.',
            favAnime: 'Your Name',
            favColor: 'Sakura Pink',
            favFood: 'Sushi 🍣',
            birthday: 'November 14',
            location: 'Loved ❤️'
          },
          badges: ['Sakura Seed 🌸', 'Sakura Star ✨'],
          achievements: ['Welcome Home ❤️', 'Profile Customized 🎀']
        });

        // Link actual user IDs back to relationship
        await Relationship.findByIdAndUpdate(rel._id, {
          partner1: user1._id,
          partner2: user2._id
        });

        // Seed Notes
        await Note.create([
          {
            relationshipId: rel._id.toString(),
            sender: 'haru',
            type: 'sticky',
            content: 'Don\'t forget to buy strawberry pocky! 🍓',
            color: '#FFC1CC'
          },
          {
            relationshipId: rel._id.toString(),
            sender: 'sakura',
            type: 'sticky',
            content: 'I love you to the moon and back 🌙',
            color: '#E6E6FA'
          }
        ]);

        // Seed Memories
        await Memory.create([
          {
            relationshipId: rel._id.toString(),
            title: 'Our First Picnic 🌸',
            description: 'Sitting under the cherry blossoms sharing sandwiches.',
            mediaUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop',
            mediaType: 'image',
            date: '2025-04-10',
            category: 'Cozy Dates',
            isFavorite: true
          },
          {
            relationshipId: rel._id.toString(),
            title: 'Cozy Cafe Escape ☕',
            description: 'Escaped the rain to drink warm matcha tea.',
            mediaUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop',
            mediaType: 'image',
            date: '2025-10-15',
            category: 'Cozy Dates',
            isFavorite: false
          }
        ]);

        // Seed Planner
        await Planner.create([
          {
            relationshipId: rel._id.toString(),
            type: 'task',
            title: 'Plan next movie night 🍿',
            description: 'Decide between anime films!',
            completed: false,
            assignee: 'haru'
          },
          {
            relationshipId: rel._id.toString(),
            type: 'shopping',
            title: 'Matcha green tea powder 🍵',
            description: 'For baking cookies',
            completed: true
          },
          {
            relationshipId: rel._id.toString(),
            type: 'calendar_event',
            title: 'Our Anniversary Dinner 🎉',
            description: 'Table booked at Tokyo Garden.',
            dueDate: '2026-02-14'
          }
        ]);

        console.log('🌸 MongoDB Seeding completed successfully! 🌸');
      }
    }
  } catch (err) {
    console.error('Error during database seeding:', err.message);
  }
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
