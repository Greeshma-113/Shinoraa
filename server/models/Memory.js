const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  relationshipId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, default: 'image' }, // image, video
  date: { type: String, required: true },
  category: { type: String, default: 'General' },
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Memory || mongoose.model('Memory', MemorySchema);
