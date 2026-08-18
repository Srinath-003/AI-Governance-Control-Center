/**
 * Deterministic Governance Trigger Classifier / Rule Engine
 * Maps normalized incoming production signals to deterministic governance actions.
 * DO NOT USE AN LLM FOR THESE DECISIONS.
 */

const GOVERNANCE_RULES = {
  MODEL_DRIFT: {
    trigger: 'MODEL_DRIFT_THRESHOLD_EXCEEDED',
    action: 'REASSESS_MODEL_CONTROLS',
    targetStatus: 'UNDER_REVIEW',
    defaultReason: 'Model concept drift detected beyond acceptable statistical threshold. Initiated governance review.',
    severity: 'HIGH'
  },
  SAFETY_VIOLATION: {
    trigger: 'SAFETY_COMPLIANCE_BREACH',
    action: 'IMMEDIATE_AGENT_SUSPENSION',
    targetStatus: 'SUSPENDED',
    defaultReason: 'Critical AI safety or policy violation detected. Automated GOVERNANCE HOLD applied.',
    severity: 'CRITICAL'
  },
  GUARDRAIL_BLOCK: {
    trigger: 'REPEATED_GUARDRAIL_TRIGGER',
    action: 'ESCALATE_TO_COMPLIANCE_QUEUE',
    targetStatus: 'UNDER_REVIEW',
    defaultReason: 'Agent breached production safety guardrails multiple times in short window.',
    severity: 'MEDIUM'
  },
  ERROR_RATE_SPIKE: {
    trigger: 'PRODUCTION_ERROR_RATE_SPIKE',
    action: 'OPEN_GOVERNANCE_INCIDENT',
    targetStatus: 'UNDER_REVIEW',
    defaultReason: 'Production failure rate exceeded 5% threshold. Escalated for human oversight.',
    severity: 'HIGH'
  },
  PERFORMANCE_DEGRADATION: {
    trigger: 'LATENCY_DEGRADATION_THRESHOLD',
    action: 'OPEN_GOVERNANCE_REVIEW',
    targetStatus: 'UNDER_REVIEW',
    defaultReason: 'SLA latency degraded significantly, triggering quality assurance review.',
    severity: 'LOW'
  }
};

/**
 * Evaluates a normalized signal and returns the deterministic governance classification.
 */
function classifySignal(signal) {
  const rule = GOVERNANCE_RULES[signal.signalType];
  if (!rule) {
    return {
      trigger: 'UNKNOWN_SIGNAL_RECEIVED',
      action: 'LOG_WARNING',
      targetStatus: null,
      reason: `Received unclassified signal type '${signal.signalType}'. No status change required.`,
      severity: 'LOW'
    };
  }

  return {
    trigger: rule.trigger,
    action: rule.action,
    targetStatus: rule.targetStatus,
    reason: signal.metadata?.reason || rule.defaultReason,
    severity: signal.severity || rule.severity
  };
}

module.exports = {
  GOVERNANCE_RULES,
  classifySignal
};
