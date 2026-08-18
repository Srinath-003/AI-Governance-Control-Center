const express = require('express');
const router = express.Router();
const {
  startSimulation,
  stopSimulation,
  getSimulationStatus,
  emitNextSignal
} = require('../services/simulator');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * POST /api/simulation/start
 * Start periodic monitoring simulation
 */
router.post('/start', requireAuth, (req, res) => {
  const { intervalMs = 4000 } = req.body;
  const status = startSimulation(intervalMs);
  res.json({ message: 'Simulation started', ...status });
});

/**
 * POST /api/simulation/stop
 * Stop monitoring simulation
 */
router.post('/stop', requireAuth, (req, res) => {
  const status = stopSimulation();
  res.json({ message: 'Simulation stopped', ...status });
});

/**
 * GET /api/simulation/status
 * Get simulation engine status
 */
router.get('/status', requireAuth, (req, res) => {
  const status = getSimulationStatus();
  res.json(status);
});

/**
 * POST /api/simulation/step
 * Manually trigger the next signal in sequence
 */
router.post('/step', requireAuth, async (req, res) => {
  await emitNextSignal();
  res.json({ message: 'Single simulation step emitted', status: getSimulationStatus() });
});

module.exports = router;
