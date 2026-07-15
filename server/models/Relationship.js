const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema({
  partner1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partner2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  inviteCode: { type: String, required: true, unique: true },
  startDate: { type: Date, default: Date.now },
  dailyStreak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  loveQuotes: [{ type: String }],
  customWallpapers: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.models.Relationship || mongoose.model('Relationship', RelationshipSchema);
