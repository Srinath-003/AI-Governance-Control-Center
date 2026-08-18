const express = require('express');
const router = express.Router();
const Signal = require('../models/Signal');
const { processIncomingSignal } = require('../services/signalIngester');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * POST /api/signals
 * Signal Ingestion Endpoint (Decoupled ingestion layer for simulator or Prometheus/OpenTelemetry/Webhooks)
 */
router.post('/', async (req, res) => {
  try {
    const rawPayload = req.body;
    const result = await processIncomingSignal(rawPayload);
    res.status(201).json({
      message: 'Signal successfully ingested and processed through governance pipeline.',
      ...result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/signals
 * Query historical telemetry signals
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { agentId, signalType, limit = 50 } = req.query;
    const filter = {};

    if (agentId) filter.agentId = agentId;
    if (signalType) filter.signalType = signalType;

    const signals = await Signal.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ count: signals.length, signals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
