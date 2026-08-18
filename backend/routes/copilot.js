const express = require('express');
const router = express.Router();
const { queryCopilot, assembleGovernanceContext } = require('../services/copilotService');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * POST /api/copilot/chat
 * Query the Governance Copilot LLM Assistant
 */
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { prompt, agentId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const response = await queryCopilot(prompt, agentId);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/copilot/context
 * Retrieve complete governance context passed to the copilot
 */
router.get('/context', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.query;
    const context = await assembleGovernanceContext(agentId);
    res.json(context);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
