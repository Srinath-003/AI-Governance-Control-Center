const Agent = require('../models/Agent');
const AuditLog = require('../models/AuditLog');

const ALLOWED_TRANSITIONS = {
  GREEN: ['UNDER_REVIEW', 'SUSPENDED'],
  UNDER_REVIEW: ['REMEDIATED', 'SUSPENDED'],
  SUSPENDED: ['UNDER_REVIEW'], // Direct SUSPENDED -> GREEN is strictly forbidden!
  REMEDIATED: ['GREEN', 'UNDER_REVIEW', 'SUSPENDED']
};

/**
 * Validates whether a state transition is permitted.
 */
function isValidTransition(currentStatus, targetStatus) {
  if (currentStatus === targetStatus) return true; // Idempotent / stay in same status
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus];
  return allowedNext && allowedNext.includes(targetStatus);
}

/**
 * Executes a governance state transition and records an immutable audit log entry.
 */
async function transitionState({
  agentId,
  targetStatus,
  trigger,
  action,
  reason,
  reviewer = 'SYSTEM_AUTOMATION',
  eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  signalType = 'GOVERNANCE_RULE',
  metadata = {}
}) {
  const agent = await Agent.findOne({ agentId });
  if (!agent) {
    throw new Error(`Agent with ID '${agentId}' not found.`);
  }

  const currentStatus = agent.status;

  // Enforce state machine transition validation
  if (!isValidTransition(currentStatus, targetStatus)) {
    throw new Error(
      `INVALID_STATE_TRANSITION: Transition from '${currentStatus}' to '${targetStatus}' is strictly prohibited by governance state machine rules. Suspended agents must be placed UNDER_REVIEW and REMEDIATED before restoration.`
    );
  }

  // Update agent status and associated flags
  agent.status = targetStatus;
  agent.lastSignalType = signalType || agent.lastSignalType;
  agent.lastSignalAt = new Date();

  if (targetStatus === 'SUSPENDED') {
    agent.holdReason = reason || 'Suspended by automated governance rule enforcement.';
    agent.reviewStartedAt = null;
    agent.slaBreached = false;
  } else if (targetStatus === 'UNDER_REVIEW') {
    if (!agent.reviewStartedAt) {
      agent.reviewStartedAt = new Date();
    }
    agent.holdReason = reason || 'Placed under governance compliance review.';
  } else if (targetStatus === 'REMEDIATED') {
    agent.holdReason = null;
  } else if (targetStatus === 'GREEN') {
    agent.holdReason = null;
    agent.reviewStartedAt = null;
    agent.slaBreached = false;
  }

  if (targetStatus === 'SUSPENDED' || targetStatus === 'UNDER_REVIEW') {
    agent.incidentCount = (agent.incidentCount || 0) + 1;
  }

  await agent.save();

  // Create mandatory Audit Log record
  const auditEntry = new AuditLog({
    eventId,
    agentId,
    signalType,
    trigger,
    action,
    previousStatus: currentStatus,
    newStatus: targetStatus,
    reviewer,
    reason: reason || `Transitioned to ${targetStatus}`,
    metadata,
    timestamp: new Date()
  });

  await auditEntry.save();

  return {
    agent,
    auditEntry,
    previousStatus: currentStatus,
    newStatus: targetStatus
  };
}

module.exports = {
  ALLOWED_TRANSITIONS,
  isValidTransition,
  transitionState
};
