const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true },
  agentId: { type: String, required: true },
  title: { type: String, required: true },
  signalType: { type: String, required: true },
  severity: { type: String, default: 'HIGH' },
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED'],
    default: 'OPEN'
  },
  description: { type: String, required: true },
  assignedTo: { type: String, default: 'Governance Team' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Incident', incidentSchema);
