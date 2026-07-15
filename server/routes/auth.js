const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'sakura_secret_key_1337';

// Generate a random Invite Code
function generateInviteCode() {
  return 'SAKURA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, inviteCode } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Enforce 2-person limit global check
    const totalUsers = await db.users.countDocuments();
    if (totalUsers >= 2) {
      return res.status(400).json({ error: 'This Shinoraa app is private and already has 2 registered users.' });
    }

    // Check if user already exists
    const existingUser = await db.users.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // If inviteCode is provided, we try to join an existing relationship
    let relationshipId = null;
    let isPartner2 = false;

    if (inviteCode) {
      const rel = await db.relationships.findOne({ inviteCode });
      if (!rel) {
        return res.status(400).json({ error: 'Invalid Sakura Invite Code.' });
      }
      if (rel.partner2) {
        return res.status(400).json({ error: 'This relationship already has two partners connected.' });
      }
      relationshipId = rel._id;
      isPartner2 = true;
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Create user in DB (initially unverified, needs OTP)
    const newUser = await db.users.create({
      username,
      email,
      passwordHash,
      relationshipId,
      otpCode,
      otpExpires,
      profile: {
        nickname: username,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        banner: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&auto=format&fit=crop',
        bio: 'Hello! We are building our Sakura world together.',
        birthday: '',
        location: '',
        favAnime: 'Your Name',
        favColor: 'Sakura Pink',
        favFood: 'Ramen'
      },
      badges: ['Sakura Seed 🌸'],
      achievements: ['Welcome Home ❤️']
    });

    console.log(`🌸 [OTP SENT] Verification Code for ${email} is: ${otpCode} 🌸`);

    // If not partner 2, we create a new relationship
    if (!isPartner2) {
      const newInvite = generateInviteCode();
      const newRel = await db.relationships.create({
        partner1: newUser._id,
        inviteCode: newInvite,
        startDate: new Date().toISOString(),
        dailyStreak: 1,
        lastActive: new Date().toISOString(),
        loveQuotes: [
          "In all the world, there is no heart for me like yours. 🌸",
          "You make my heart bloom like a cherry blossom in spring. ❤️",
          "Together is my favorite place to be."
        ]
      });

      // Update user with relationship ID
      await db.users.findByIdAndUpdate(newUser._id, { relationshipId: newRel._id });
    } else {
      // Connect Partner 2 to the relationship
      await db.relationships.findByIdAndUpdate(relationshipId, { partner2: newUser._id });
    }

    res.status(200).json({
      message: 'Registration successful! Verification OTP sent to your email.',
      email: email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// OTP VERIFY ROUTE
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Please enter OTP.' });
    }

    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Clear OTP after successful verification
    const updatedUser = await db.users.findByIdAndUpdate(user._id, {
      otpCode: null,
      otpExpires: null
    });

    // Fetch relationship and partner
    let partner = null;
    let relationship = null;

    if (updatedUser.relationshipId) {
      relationship = await db.relationships.findById(updatedUser.relationshipId);
      if (relationship) {
        const partnerId = relationship.partner1.toString() === updatedUser._id.toString() 
          ? relationship.partner2 
          : relationship.partner1;
        if (partnerId) {
          partner = await db.users.findById(partnerId);
        }
      }
    }

    const token = jwt.sign({ userId: updatedUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'OTP verified successfully!',
      token,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        relationshipId: updatedUser.relationshipId,
        profile: updatedUser.profile,
        badges: updatedUser.badges,
        achievements: updatedUser.achievements
      },
      partner: partner ? {
        _id: partner._id,
        username: partner.username,
        profile: partner.profile,
        badges: partner.badges,
        achievements: partner.achievements
      } : null,
      relationship
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OTP verification failed.' });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide Email and Password.' });
    }

    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Email or Password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Email or Password.' });
    }

    // Fetch relationship and partner
    let partner = null;
    let relationship = null;

    if (user.relationshipId) {
      relationship = await db.relationships.findById(user.relationshipId);
      if (relationship) {
        const partnerId = relationship.partner1.toString() === user._id.toString() 
          ? relationship.partner2 
          : relationship.partner1;
        if (partnerId) {
          partner = await db.users.findById(partnerId);
        }
        
        // Update streak logic
        const lastActiveDate = new Date(relationship.lastActive).toDateString();
        const todayDate = new Date().toDateString();
        if (lastActiveDate !== todayDate) {
          let updatedStreak = relationship.dailyStreak || 0;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastActiveDate === yesterday.toDateString()) {
            updatedStreak += 1;
          } else {
            updatedStreak = 1; // reset streak if yesterday was missed
          }
          relationship = await db.relationships.findByIdAndUpdate(relationship._id, {
            dailyStreak: updatedStreak,
            lastActive: new Date().toISOString()
          });
        }
      }
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        relationshipId: user.relationshipId,
        profile: user.profile,
        badges: user.badges,
        achievements: user.achievements
      },
      partner: partner ? {
        _id: partner._id,
        username: partner.username,
        profile: partner.profile,
        badges: partner.badges,
        achievements: partner.achievements
      } : null,
      relationship
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// PASSWORD RESET
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No user registered with this email.' });
    }
    const tempOtp = generateOTP();
    await db.users.findByIdAndUpdate(user._id, {
      otpCode: tempOtp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000)
    });
    console.log(`🌸 [PASSWORD RESET OTP] Code for ${email} is: ${tempOtp} 🌸`);
    res.status(200).json({ message: 'Password reset OTP sent successfully!', email });
  } catch (err) {
    res.status(500).json({ error: 'Password reset request failed.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await db.users.findOne({ email });
    if (!user || user.otpCode !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await db.users.findByIdAndUpdate(user._id, {
      passwordHash,
      otpCode: null,
      otpExpires: null
    });
    res.status(200).json({ message: 'Password reset successful! You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed.' });
  }
});

module.exports = router;
