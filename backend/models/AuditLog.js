const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  agentId: { type: String, required: true },
  signalType: { type: String, default: 'MANUAL_ACTION' },
  trigger: { type: String, required: true },
  action: { type: String, required: true },
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  reviewer: { type: String, default: 'SYSTEM_AUTOMATION' },
  reason: { type: String, required: true },
  metadata: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
