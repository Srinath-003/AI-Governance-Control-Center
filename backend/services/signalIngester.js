const Signal = require('../models/Signal');
const Incident = require('../models/Incident');
const { classifySignal } = require('./triggerClassifier');
const { transitionState } = require('./stateMachine');

/**
 * Validates and normalizes incoming telemetry signals.
 * Supports both camelCase (agentId, signalType) and snake_case (agent_id, signal_type).
 */
function normalizeSignal(payload) {
  if (!payload) {
    throw new Error('Signal payload is required.');
  }

  const agentId = payload.agentId || payload.agent_id;
  const signalType = payload.signalType || payload.signal_type;

  if (!agentId || !signalType) {
    throw new Error('Invalid signal payload: agentId (or agent_id) and signalType (or signal_type) are required.');
  }

  const validTypes = [
    'MODEL_DRIFT',
    'SAFETY_VIOLATION',
    'GUARDRAIL_BLOCK',
    'ERROR_RATE_SPIKE',
    'PERFORMANCE_DEGRADATION'
  ];

  if (!validTypes.includes(signalType)) {
    throw new Error(`Unsupported signalType: '${signalType}'. Must be one of ${validTypes.join(', ')}`);
  }

  return {
    eventId: payload.event_id || payload.eventId || `sig_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    agentId,
    signalType,
    severity: payload.severity || 'MEDIUM',
    value: payload.value !== undefined ? payload.value : null,
    threshold: payload.threshold !== undefined ? payload.threshold : null,
    source: payload.source || 'Signal Ingestion Pipeline',
    metadata: payload.metadata || {},
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date()
  };
}

/**
 * Ingests raw telemetry signals, normalizes them, classifies governance rules,
 * and updates agent governance status via state machine.
 */
async function processIncomingSignal(rawPayload) {
  // 1. Validate & Normalize
  const normalizedSignal = normalizeSignal(rawPayload);

  // 2. Persist Signal
  const savedSignal = new Signal(normalizedSignal);
  await savedSignal.save();

  // 3. Governance Trigger Classification
  const classification = classifySignal(normalizedSignal);

  let transitionResult = null;

  // 4. Execute Governance Action if target status is defined
  if (classification.targetStatus) {
    try {
      transitionResult = await transitionState({
        agentId: normalizedSignal.agentId,
        targetStatus: classification.targetStatus,
        trigger: classification.trigger,
        action: classification.action,
        reason: classification.reason,
        reviewer: 'AUTOMATED_GOVERNANCE_ENGINE',
        eventId: normalizedSignal.eventId,
        signalType: normalizedSignal.signalType,
        metadata: normalizedSignal.metadata
      });
    } catch (err) {
      console.warn(`[Ingester] State transition skipped or disallowed for ${normalizedSignal.agentId}: ${err.message}`);
    }
  }

  // 5. Create an Incident record if appropriate
  if (classification.targetStatus === 'SUSPENDED' || classification.targetStatus === 'UNDER_REVIEW') {
    const incidentId = `inc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newIncident = new Incident({
      incidentId,
      agentId: normalizedSignal.agentId,
      title: `${normalizedSignal.signalType} detected on ${normalizedSignal.agentId}`,
      signalType: normalizedSignal.signalType,
      severity: classification.severity,
      status: 'OPEN',
      description: classification.reason,
      createdAt: new Date()
    });
    await newIncident.save();
  }

  return {
    signal: savedSignal,
    classification,
    transitionResult
  };
}

module.exports = {
  normalizeSignal,
  processIncomingSignal
};
