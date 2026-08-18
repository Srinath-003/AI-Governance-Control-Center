const Agent = require('../models/Agent');
const AuditLog = require('../models/AuditLog');
const Incident = require('../models/Incident');

const SLA_HOURS = 48;
const SLA_MS = SLA_HOURS * 60 * 60 * 1000;

/**
 * Checks all agents currently UNDER_REVIEW to see if they exceeded 48h SLA.
 */
async function checkSLACompliance() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - SLA_MS);

  // Find agents UNDER_REVIEW whose review started > 48h ago and haven't been flagged breached
  const breachedAgents = await Agent.find({
    status: 'UNDER_REVIEW',
    reviewStartedAt: { $lt: cutoff },
    slaBreached: { $ne: true }
  });

  const escalated = [];

  for (const agent of breachedAgents) {
    agent.slaBreached = true;
    await agent.save();

    // Add Audit log for SLA Breach
    const auditEntry = new AuditLog({
      eventId: `sla_${Date.now()}_${agent.agentId}`,
      agentId: agent.agentId,
      signalType: 'SLA_BREACH',
      trigger: '48_HOUR_SLA_EXCEEDED',
      action: 'ESCALATE_TO_SENIOR_REVIEWER',
      previousStatus: 'UNDER_REVIEW',
      newStatus: 'UNDER_REVIEW',
      reviewer: 'SLA_GOVERNANCE_MONITOR',
      reason: `Agent has been UNDER_REVIEW for over 48 hours without remediation. Escalated to Senior Compliance Officer.`,
      timestamp: new Date()
    });
    await auditEntry.save();

    // Update open incident
    await Incident.updateMany(
      { agentId: agent.agentId, status: 'OPEN' },
      { $set: { severity: 'CRITICAL', title: `[SLA BREACHED] ${agent.name} - Under Review > 48h` } }
    );

    escalated.push(agent.agentId);
  }

  return escalated;
}

/**
 * Fast-forward SLA simulation for hackathon demo:
 * Forces a target agent (or the first agent UNDER_REVIEW) to set reviewStartedAt to 50 hours ago.
 */
async function simulateSLABreach(agentId) {
  let agent;
  if (agentId) {
    agent = await Agent.findOne({ agentId });
  } else {
    agent = await Agent.findOne({ status: 'UNDER_REVIEW' });
  }

  if (!agent) {
    throw new Error('No agent found to breach SLA. Place an agent UNDER_REVIEW first.');
  }

  // Ensure state is UNDER_REVIEW
  if (agent.status !== 'UNDER_REVIEW') {
    agent.status = 'UNDER_REVIEW';
  }

  // Set review start time to 50 hours ago
  const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000);
  agent.reviewStartedAt = fiftyHoursAgo;
  agent.slaBreached = true;
  await agent.save();

  // Audit log entry for SLA simulation
  const auditEntry = new AuditLog({
    eventId: `sla_sim_${Date.now()}`,
    agentId: agent.agentId,
    signalType: 'SLA_BREACH_SIMULATION',
    trigger: 'MANUAL_SLA_FAST_FORWARD',
    action: 'ESCALATE_TO_SENIOR_REVIEWER',
    previousStatus: 'UNDER_REVIEW',
    newStatus: 'UNDER_REVIEW',
    reviewer: 'GOVERNANCE_DEMO_ADMIN',
    reason: 'Simulated 50-hour passage of time. 48-Hour Governance SLA breached! Automatically escalated to Senior Reviewer.',
    timestamp: new Date()
  });
  await auditEntry.save();

  return {
    agent,
    hoursElapsed: 50,
    slaBreached: true
  };
}

module.exports = {
  checkSLACompliance,
  simulateSLABreach
};
