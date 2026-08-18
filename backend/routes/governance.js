const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const AuditLog = require('../models/AuditLog');
const Incident = require('../models/Incident');
const { checkSLACompliance, simulateSLABreach } = require('../services/slaService');
const { getSimulationStatus } = require('../services/simulator');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * GET /api/governance/stats
 * Dashboard summary KPIs
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const agents = await Agent.find({});

    const total = agents.length;
    const green = agents.filter((a) => a.status === 'GREEN').length;
    const underReview = agents.filter((a) => a.status === 'UNDER_REVIEW').length;
    const suspended = agents.filter((a) => a.status === 'SUSPENDED').length;
    const remediated = agents.filter((a) => a.status === 'REMEDIATED').length;
    const slaBreached = agents.filter((a) => a.slaBreached).length;

    const recentIncidents = await Incident.find({}).sort({ createdAt: -1 }).limit(10);
    const recentActions = await AuditLog.find({}).sort({ timestamp: -1 }).limit(10);

    const simulationStatus = getSimulationStatus();

    res.json({
      summary: {
        total,
        green,
        underReview,
        suspended,
        remediated,
        slaBreached
      },
      simulation: simulationStatus,
      recentIncidents,
      recentActions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/governance/audit
 * Queryable audit trail with search and filter capabilities
 */
router.get('/audit', requireAuth, async (req, res) => {
  try {
    const { agentId, signalType, status, limit = 100 } = req.query;
    const filter = {};

    if (agentId) filter.agentId = agentId;
    if (signalType) filter.signalType = signalType;
    if (status) filter.newStatus = status;

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/governance/incidents
 * List incidents requiring attention
 */
router.get('/incidents', requireAuth, async (req, res) => {
  try {
    const incidents = await Incident.find({}).sort({ createdAt: -1 });
    res.json({ count: incidents.length, incidents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/governance/sla/check
 * Trigger backend SLA compliance check
 */
router.post('/sla/check', requireAuth, async (req, res) => {
  try {
    const escalated = await checkSLACompliance();
    res.json({ message: 'SLA evaluation complete', escalatedAgents: escalated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/governance/sla/fast-forward
 * Fast-forward time for SLA demonstration in hackathon
 */
router.post('/sla/fast-forward', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.body;
    const result = await simulateSLABreach(agentId);
    res.json({
      message: 'SLA Breach simulated successfully! Agent status updated and audit entry recorded.',
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
