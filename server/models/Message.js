const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  relationshipId: { type: String, required: true },
  sender: { type: String, required: true },
  content: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, default: 'text' }, // text, image, voice, gif
  reactions: [{
    username: { type: String },
    reaction: { type: String }
  }],
  readBy: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
