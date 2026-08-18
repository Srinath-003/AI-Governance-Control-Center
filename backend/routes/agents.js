const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Signal = require('../models/Signal');
const AuditLog = require('../models/AuditLog');
const Incident = require('../models/Incident');
const { transitionState } = require('../services/stateMachine');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * GET /api/agents
 * List all governed agents with summary metrics
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const agents = await Agent.find({}).sort({ agentId: 1 });
    res.json({ count: agents.length, agents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/agents/:agentId
 * Get detailed agent governance profile, history, signals, and incidents
 */
router.get('/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await Agent.findOne({ agentId });

    if (!agent) {
      return res.status(404).json({ error: `Agent '${agentId}' not found.` });
    }

    const signals = await Signal.find({ agentId }).sort({ timestamp: -1 }).limit(20);
    const auditLogs = await AuditLog.find({ agentId }).sort({ timestamp: -1 }).limit(20);
    const incidents = await Incident.find({ agentId }).sort({ createdAt: -1 }).limit(10);

    res.json({
      agent,
      signals,
      auditLogs,
      incidents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/agents/:agentId/request
 * AGENT REQUEST ENFORCEMENT ENDPOINT (Simulates external application calling the agent)
 * Backend MUST enforce governance hold for SUSPENDED agents!
 */
router.post('/:agentId/request', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { prompt, metadata } = req.body;

    const agent = await Agent.findOne({ agentId });
    if (!agent) {
      return res.status(404).json({ error: `Agent '${agentId}' does not exist.` });
    }

    // ENFORCEMENT CHECK: Reject suspended agents with 403 GOVERNANCE_HOLD
    if (agent.status === 'SUSPENDED') {
      return res.status(403).json({
        status: 'blocked',
        reason: 'GOVERNANCE_HOLD',
        message: 'This agent is currently suspended pending governance review.',
        details: {
          agentId: agent.agentId,
          agentName: agent.name,
          holdReason: agent.holdReason || 'Critical Safety or Policy Violation',
          suspendedSince: agent.updatedAt
        }
      });
    }

    // Response for GREEN / REMEDIATED agents
    res.json({
      status: 'success',
      agentId: agent.agentId,
      agentName: agent.name,
      governanceStatus: agent.status,
      response: `[Agent Response from ${agent.name}]: Request processed successfully. Prompt verified against production compliance policies.`,
      timestamp: new Date().toISOString(),
      executionTimeMs: Math.floor(Math.random() * 80) + 40
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/agents/:agentId/review
 * Transition agent state: SUSPENDED -> UNDER_REVIEW or GREEN -> UNDER_REVIEW
 */
router.post('/:agentId/review', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { reason, reviewerNotes } = req.body;

    const result = await transitionState({
      agentId,
      targetStatus: 'UNDER_REVIEW',
      trigger: 'MANUAL_GOVERNANCE_REVIEW_INITIATED',
      action: 'BEGIN_COMPLIANCE_REVIEW',
      reason: reason || reviewerNotes || 'Governance reviewer initiated compliance investigation.',
      reviewer: req.user.email,
      signalType: 'MANUAL_REVIEW'
    });

    res.json({ message: 'Agent transition to UNDER_REVIEW successful', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/agents/:agentId/remediate
 * Transition agent state: UNDER_REVIEW -> REMEDIATED
 */
router.post('/:agentId/remediate', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { reason, remediationNotes } = req.body;

    const result = await transitionState({
      agentId,
      targetStatus: 'REMEDIATED',
      trigger: 'GOVERNANCE_REMEDIATION_COMPLETE',
      action: 'MARK_REMEDIATED',
      reason: reason || remediationNotes || 'Remediation completed. Model controls re-aligned and verified.',
      reviewer: req.user.email,
      signalType: 'REMEDIATION_WORKFLOW'
    });

    // Mark active incidents resolved
    await Incident.updateMany(
      { agentId, status: { $ne: 'RESOLVED' } },
      { $set: { status: 'RESOLVED', resolvedAt: new Date() } }
    );

    res.json({ message: 'Agent transition to REMEDIATED successful', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/agents/:agentId/restore
 * Transition agent state: REMEDIATED -> GREEN
 * NOTE: If agent is SUSPENDED, state machine will throw an error and return 400!
 */
router.post('/:agentId/restore', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { reason } = req.body;

    const result = await transitionState({
      agentId,
      targetStatus: 'GREEN',
      trigger: 'GOVERNANCE_RESTORE_APPROVED',
      action: 'RESTORE_PRODUCTION_ACCESS',
      reason: reason || 'Compliance review complete. Restored to GREEN status.',
      reviewer: req.user.email,
      signalType: 'GOVERNANCE_APPROVAL'
    });

    res.json({ message: 'Agent restored to GREEN status successfully', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
