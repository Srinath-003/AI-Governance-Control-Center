const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  agentId: { type: String, required: true },
  signalType: {
    type: String,
    enum: [
      'MODEL_DRIFT',
      'SAFETY_VIOLATION',
      'GUARDRAIL_BLOCK',
      'ERROR_RATE_SPIKE',
      'PERFORMANCE_DEGRADATION'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  value: { type: mongoose.Schema.Types.Mixed, default: null },
  threshold: { type: mongoose.Schema.Types.Mixed, default: null },
  source: { type: String, default: 'Simulator Ingestion' },
  metadata: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Signal', signalSchema);
