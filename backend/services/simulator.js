const { processIncomingSignal } = require('./signalIngester');

let isRunning = false;
let timerId = null;
let sequenceIndex = 0;

const SIMULATION_SEQUENCE = [
  {
    agent_id: 'agent-002',
    signal_type: 'MODEL_DRIFT',
    severity: 'HIGH',
    value: 0.38,
    threshold: 0.15,
    metadata: {
      metric: 'Kolmogorov-Smirnov Drift Score',
      featureGroup: 'Financial Vector Embeddings',
      reason: 'Feature vector distribution shifted by 38% over 24h baseline window.'
    }
  },
  {
    agent_id: 'agent-003',
    signal_type: 'SAFETY_VIOLATION',
    severity: 'CRITICAL',
    value: 'UNSAFE_PROMPT_INJECTION',
    threshold: 'ZERO_TOLERANCE',
    metadata: {
      policyCategory: 'System Prompt Hijack / PII Leakage',
      flaggedInput: 'User requested internal API keys and database credentials.',
      reason: 'Critical safety violation: Attempted system prompt jailbreak detected.'
    }
  },
  {
    agent_id: 'agent-001',
    signal_type: 'GUARDRAIL_BLOCK',
    severity: 'MEDIUM',
    value: 12,
    threshold: 5,
    metadata: {
      guardrailRule: 'Toxic Tone & Off-brand Output Prevention',
      reason: 'Agent triggered guardrail filter 12 times within 10 minutes.'
    }
  },
  {
    agent_id: 'agent-004',
    signal_type: 'ERROR_RATE_SPIKE',
    severity: 'HIGH',
    value: '8.4%',
    threshold: '2.0%',
    metadata: {
      errorType: '502 Bad Gateway / Tool Calling Timeout',
      reason: 'External web search tool calling failed with high error rate (8.4%).'
    }
  },
  {
    agent_id: 'agent-005',
    signal_type: 'PERFORMANCE_DEGRADATION',
    severity: 'LOW',
    value: '4820ms',
    threshold: '1500ms',
    metadata: {
      metric: 'P99 Latency',
      reason: 'Recommendation inference latency exceeded SLA limit.'
    }
  }
];

function startSimulation(intervalMs = 4000) {
  if (isRunning) return { status: 'already_running', isRunning: true };

  isRunning = true;
  console.log('[Simulator] Monitoring signal simulation STARTED.');

  // Emit first event immediately
  emitNextSignal();

  timerId = setInterval(() => {
    emitNextSignal();
  }, intervalMs);

  return { status: 'started', isRunning: true };
}

function stopSimulation() {
  if (!isRunning) return { status: 'already_stopped', isRunning: false };

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isRunning = false;
  console.log('[Simulator] Monitoring signal simulation STOPPED.');

  return { status: 'stopped', isRunning: false };
}

function getSimulationStatus() {
  return { isRunning, currentSequenceIndex: sequenceIndex };
}

async function emitNextSignal() {
  if (!isRunning) return;

  const rawSignal = SIMULATION_SEQUENCE[sequenceIndex % SIMULATION_SEQUENCE.length];
  sequenceIndex++;

  const fullPayload = {
    ...rawSignal,
    event_id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };

  try {
    const result = await processIncomingSignal(fullPayload);
    console.log(
      `[Simulator] Emitted signal: ${fullPayload.signal_type} for ${fullPayload.agent_id} -> Resulting status: ${result.transitionResult?.newStatus || 'NO_CHANGE'}`
    );
  } catch (err) {
    console.error(`[Simulator] Error processing signal: ${err.message}`);
  }
}

module.exports = {
  startSimulation,
  stopSimulation,
  getSimulationStatus,
  emitNextSignal
};
