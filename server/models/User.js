const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  relationshipId: { type: String, default: null },
  otpCode: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  profile: {
    nickname: { type: String, default: '' },
    avatar: { type: String, default: '' },
    banner: { type: String, default: '' },
    bio: { type: String, default: '' },
    favAnime: { type: String, default: '' },
    favColor: { type: String, default: '' },
    favFood: { type: String, default: '' },
    birthday: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  badges: [{ type: String }],
  achievements: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
