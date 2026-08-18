const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'General' },
  status: {
    type: String,
    enum: ['GREEN', 'UNDER_REVIEW', 'SUSPENDED', 'REMEDIATED'],
    default: 'GREEN'
  },
  holdReason: { type: String, default: null },
  lastSignalType: { type: String, default: null },
  lastSignalAt: { type: Date, default: null },
  reviewStartedAt: { type: Date, default: null },
  slaBreached: { type: Boolean, default: false },
  incidentCount: { type: Number, default: 0 },
  version: { type: String, default: '1.0.0' },
  endpoint: { type: String, default: '/api/v1/agent' },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

agentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Agent', agentSchema);
