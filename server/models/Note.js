const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  relationshipId: { type: String, required: true },
  sender: { type: String, required: true },
  type: { type: String, required: true }, // sticky, secret, love
  content: { type: String, required: true },
  color: { type: String, default: '#FFC1CC' },
  pinned: { type: Boolean, default: false },
  isOpened: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Note || mongoose.model('Note', NoteSchema);
