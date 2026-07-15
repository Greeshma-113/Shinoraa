const mongoose = require('mongoose');

const PlannerSchema = new mongoose.Schema({
  relationshipId: { type: String, required: true },
  type: { type: String, required: true }, // task, shopping, calendar_event
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  assignee: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.models.Planner || mongoose.model('Planner', PlannerSchema);
