const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');

// Setup multer for local file uploads
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ----------------------------------------------------
// 1. RELATIONSHIP & DASHBOARD STATUS
// ----------------------------------------------------
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (!req.relationshipId) {
      return res.status(200).json({ relationship: null, partner: null });
    }

    const relationship = await db.relationships.findById(req.relationshipId);
    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found.' });
    }

    // Find partner profile
    const partnerId = relationship.partner1.toString() === req.userId.toString()
      ? relationship.partner2
      : relationship.partner1;

    let partner = null;
    if (partnerId) {
      partner = await db.users.findById(partnerId);
      if (partner) {
        partner = {
          _id: partner._id,
          username: partner.username,
          profile: partner.profile,
          badges: partner.badges,
          achievements: partner.achievements
        };
      }
    }

    res.status(200).json({ relationship, partner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

// Update Anniversary Date or Love Quotes
router.put('/relationship', auth, async (req, res) => {
  try {
    if (!req.relationshipId) {
      return res.status(400).json({ error: 'No relationship created yet.' });
    }
    const { startDate, loveQuotes, customWallpapers } = req.body;
    const updates = {};
    if (startDate) updates.startDate = startDate;
    if (loveQuotes) updates.loveQuotes = loveQuotes;
    if (customWallpapers) updates.customWallpapers = customWallpapers;

    const rel = await db.relationships.findByIdAndUpdate(req.relationshipId, updates);
    res.status(200).json(rel);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update relationship settings.' });
  }
});

// ----------------------------------------------------
// 2. PROFILE SETTINGS & AVATAR GENERATION
// ----------------------------------------------------
router.put('/profile', auth, async (req, res) => {
  try {
    const { nickname, avatar, banner, bio, favAnime, favColor, favFood, birthday, location } = req.body;
    
    const user = await db.users.findById(req.userId);
    const updatedProfile = {
      ...user.profile,
      nickname: nickname || user.profile.nickname,
      avatar: avatar || user.profile.avatar,
      banner: banner || user.profile.banner,
      bio: bio || user.profile.bio,
      favAnime: favAnime || user.profile.favAnime,
      favColor: favColor || user.profile.favColor,
      favFood: favFood || user.profile.favFood,
      birthday: birthday || user.profile.birthday,
      location: location || user.profile.location,
    };

    // Add profile updated achievements/badges if first time editing
    let badges = [...user.badges];
    let achievements = [...user.achievements];
    if (!badges.includes('Sakura Star ✨')) {
      badges.push('Sakura Star ✨');
      achievements.push('Profile Customized 🎀');
    }

    const updatedUser = await db.users.findByIdAndUpdate(req.userId, { 
      profile: updatedProfile,
      badges,
      achievements
    });

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      relationshipId: updatedUser.relationshipId,
      profile: updatedUser.profile,
      badges: updatedUser.badges,
      achievements: updatedUser.achievements
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Upload profile image / banner
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl });
  } catch (err) {
    res.status(500).json({ error: 'File upload failed.' });
  }
});

// ----------------------------------------------------
// 3. MEMORIES (Scrapbook, timeline, photos, videos)
// ----------------------------------------------------
router.get('/memories', auth, async (req, res) => {
  try {
    const list = await db.memories.find({ relationshipId: req.relationshipId });
    // sort by date descending
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memories.' });
  }
});

router.post('/memories', auth, async (req, res) => {
  try {
    const { title, description, mediaUrl, mediaType, date, category } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: 'Title and Date are required.' });
    }

    const newMem = await db.memories.create({
      relationshipId: req.relationshipId,
      title,
      description,
      mediaUrl,
      mediaType: mediaType || 'image',
      date,
      category: category || 'General',
      isFavorite: false
    });

    // Check achievement for first memory
    const user = await db.users.findById(req.userId);
    let badges = [...user.badges];
    let achievements = [...user.achievements];
    if (!badges.includes('Memory Maker 📸')) {
      badges.push('Memory Maker 📸');
      achievements.push('First Memory Saved 🌸');
      await db.users.findByIdAndUpdate(req.userId, { badges, achievements });
    }

    res.status(200).json(newMem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create memory.' });
  }
});

router.put('/memories/:id', auth, async (req, res) => {
  try {
    const updated = await db.memories.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update memory.' });
  }
});

router.delete('/memories/:id', auth, async (req, res) => {
  try {
    await db.memories.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete memory.' });
  }
});

// ----------------------------------------------------
// 4. NOTES (Sticky Notes, Love Notes, Secret Letters)
// ----------------------------------------------------
router.get('/notes', auth, async (req, res) => {
  try {
    const list = await db.notes.find({ relationshipId: req.relationshipId });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
});

router.post('/notes', auth, async (req, res) => {
  try {
    const { type, content, color, pinned } = req.body;
    if (!type || !content) {
      return res.status(400).json({ error: 'Type and Content are required.' });
    }
    const newNote = await db.notes.create({
      relationshipId: req.relationshipId,
      sender: req.user.username,
      type,
      content,
      color: color || '#FFC1CC',
      pinned: pinned || false,
      isOpened: false
    });
    res.status(200).json(newNote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save note.' });
  }
});

router.put('/notes/:id', auth, async (req, res) => {
  try {
    const updated = await db.notes.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note.' });
  }
});

router.delete('/notes/:id', auth, async (req, res) => {
  try {
    await db.notes.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

// ----------------------------------------------------
// 5. PLANNER (Tasks, Shopping checklists, Calendar Events)
// ----------------------------------------------------
router.get('/planner', auth, async (req, res) => {
  try {
    const list = await db.planner.find({ relationshipId: req.relationshipId });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch planner items.' });
  }
});

router.post('/planner', auth, async (req, res) => {
  try {
    const { type, title, description, dueDate, assignee } = req.body;
    if (!type || !title) {
      return res.status(400).json({ error: 'Type and Title are required.' });
    }
    const newItem = await db.planner.create({
      relationshipId: req.relationshipId,
      type,
      title,
      description: description || '',
      dueDate: dueDate || '',
      completed: false,
      assignee: assignee || ''
    });
    res.status(200).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save planner item.' });
  }
});

router.put('/planner/:id', auth, async (req, res) => {
  try {
    const updated = await db.planner.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update planner item.' });
  }
});

router.delete('/planner/:id', auth, async (req, res) => {
  try {
    await db.planner.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete planner item.' });
  }
});

module.exports = router;
