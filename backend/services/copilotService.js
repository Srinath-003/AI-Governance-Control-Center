const { GoogleGenerativeAI } = require('@google/generative-ai');
const Agent = require('../models/Agent');
const Signal = require('../models/Signal');
const AuditLog = require('../models/AuditLog');
const Incident = require('../models/Incident');

/**
 * Builds comprehensive governance context for an agent or system-wide incidents.
 */
async function assembleGovernanceContext(agentId = null) {
  const agents = agentId ? await Agent.find({ agentId }) : await Agent.find({});
  const signals = agentId
    ? await Signal.find({ agentId }).sort({ timestamp: -1 }).limit(10)
    : await Signal.find({}).sort({ timestamp: -1 }).limit(15);
  const auditLogs = agentId
    ? await AuditLog.find({ agentId }).sort({ timestamp: -1 }).limit(10)
    : await AuditLog.find({}).sort({ timestamp: -1 }).limit(15);
  const incidents = agentId
    ? await Incident.find({ agentId }).sort({ createdAt: -1 }).limit(5)
    : await Incident.find({ status: { $ne: 'RESOLVED' } }).sort({ createdAt: -1 }).limit(10);

  return {
    summary: {
      totalAgents: agents.length,
      suspendedCount: agents.filter((a) => a.status === 'SUSPENDED').length,
      underReviewCount: agents.filter((a) => a.status === 'UNDER_REVIEW').length,
      remediatedCount: agents.filter((a) => a.status === 'REMEDIATED').length,
      greenCount: agents.filter((a) => a.status === 'GREEN').length
    },
    agents: agents.map((a) => ({
      id: a.agentId,
      name: a.name,
      status: a.status,
      holdReason: a.holdReason,
      lastSignal: a.lastSignalType,
      lastSignalAt: a.lastSignalAt,
      slaBreached: a.slaBreached,
      description: a.description,
      category: a.category
    })),
    recentSignals: signals.map((s) => ({
      agentId: s.agentId,
      type: s.signalType,
      severity: s.severity,
      timestamp: s.timestamp,
      metadata: s.metadata
    })),
    recentAuditLogs: auditLogs.map((a) => ({
      agentId: a.agentId,
      trigger: a.trigger,
      action: a.action,
      prev: a.previousStatus,
      next: a.newStatus,
      reviewer: a.reviewer,
      reason: a.reason,
      timestamp: a.timestamp
    })),
    activeIncidents: incidents.map((i) => ({
      id: i.incidentId,
      agentId: i.agentId,
      title: i.title,
      severity: i.severity,
      status: i.status,
      description: i.description
    }))
  };
}

/**
 * Natural Conversational Chatbot Engine.
 * Answers any question naturally without robotic templates or unnecessary markdown formatting.
 */
function generateFallbackResponse(userPrompt, context) {
  const lower = userPrompt.toLowerCase().trim();

  // 1. Terminology Definitions: "remediated means", "what is remediated", "what does remediated mean", "suspended means", "green means"
  if (lower.includes('remediat')) {
    return {
      answer: `In this platform, **REMEDIATED** means that a compliance reviewer has fixed the model's underlying issue (such as updating system prompts, re-indexing vector embeddings, or applying safety filters) after a suspension or review.\n\nKey State Machine Rules:\n- **SUSPENDED** agents cannot jump directly to **GREEN**.\n- Workflow: **SUSPENDED** → **UNDER_REVIEW** → **REMEDIATED** → **GREEN**.\n- Marking an agent **REMEDIATED** confirms the fix is verified and ready for final restoration to **GREEN** status.`,
      source: 'Governance Chatbot'
    };
  }

  if (lower.includes('suspended means') || lower.includes('what is suspended') || lower.includes('hold means')) {
    return {
      answer: `**SUSPENDED** means an AI agent experienced a critical safety or policy violation and has been placed on an automated **GOVERNANCE HOLD**.\n\nWhile suspended, the backend API Gateway actively blocks all incoming user requests with an HTTP 403 Forbidden error until the compliance team initiates a review.`,
      source: 'Governance Chatbot'
    };
  }

  if (lower.includes('under review means') || lower.includes('what is under review')) {
    return {
      answer: `**UNDER_REVIEW** means an AI agent triggered a monitoring alert (such as model drift, error rate spikes, or guardrail blocks) and is actively undergoing compliance investigation by the governance team.`,
      source: 'Governance Chatbot'
    };
  }

  if (lower.includes('green means') || lower.includes('what is green') || lower.includes('healthy means')) {
    return {
      answer: `**GREEN** means the AI agent is healthy, compliant, and operating within normal production parameters. User requests to GREEN agents are processed normally.`,
      source: 'Governance Chatbot'
    };
  }

  // 2. Casual / Small Talk: "how are you", "how's it going", "what's up"
  if (lower.includes('how are you') || lower.includes("how's it going") || lower.includes("what's up") || lower.includes('how do you do')) {
    const suspended = context.summary.suspendedCount;
    const underReview = context.summary.underReviewCount;
    
    let statusText = "All 5 governed AI agents are currently healthy and operational.";
    if (suspended > 0 || underReview > 0) {
      statusText = `Currently, ${suspended > 0 ? `${suspended} agent is suspended on governance hold` : ''}${suspended > 0 && underReview > 0 ? ' and ' : ''}${underReview > 0 ? `${underReview} agent is under review` : ''}.`;
    }

    return {
      answer: `I'm doing great, thank you for asking! ${statusText}\n\nHow can I help you with your governance or compliance tasks today?`,
      source: 'Governance Chatbot'
    };
  }

  // 3. Greetings: "hi", "hello", "hey"
  if (['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'hi there', 'hello there'].includes(lower) || lower === 'hi' || lower === 'hello') {
    return {
      answer: `Hello! I am your AI Governance Chatbot. I'm here to help you monitor AI models, explain safety holds, review audit logs, and manage governance workflows.\n\nWhat would you like to check on today?`,
      source: 'Governance Chatbot'
    };
  }

  // 4. Identity / Capabilities: "who are you", "what can you do", "help"
  if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('what can you do') || lower === 'help') {
    return {
      answer: `I am the AI Governance Chatbot for your Control Center.\n\nHere is how I can assist you:\n- Explain model suspensions and safety violations\n- Analyze telemetry signals like Model Drift or Error Rate Spikes\n- Guide compliance reviewers through state machine transitions\n- Summarize historical audit trail records for any agent\n\nFeel free to ask me anything about your governed AI portfolio!`,
      source: 'Governance Chatbot'
    };
  }

  // 5. App Overview / Purpose
  if (lower.includes('what is this') || lower.includes('how does this work') || lower.includes('purpose') || lower.includes('architecture')) {
    return {
      answer: `This platform is the AI Governance Control Center. It automatically converts AI production monitoring signals (such as model drift, prompt injection, or guardrail blocks) into enforceable governance actions.\n\nWhen an agent experiences an issue, the governance engine automatically updates its state and blocks API access if suspended. Governance team reviewers then use the Review Queue to investigate, remediate, and restore access according to state machine rules.`,
      source: 'Governance Chatbot'
    };
  }

  // 6. Gratitude / Small talk finish
  if (lower.includes('thank') || lower === 'thanks' || lower === 'ok' || lower === 'okay' || lower === 'cool' || lower === 'great' || lower === 'awesome') {
    return {
      answer: `You're welcome! Let me know whenever you need further insights on your AI agents or audit history.`,
      source: 'Governance Chatbot'
    };
  }

  // 7. Specific Agent Queries (e.g. Agent-001, Agent-002, Agent-003, Financial Assistant, etc.)
  const matchedAgent = context.agents.find(
    (a) =>
      lower.includes(a.id.toLowerCase()) ||
      lower.includes(a.name.toLowerCase()) ||
      (a.category && lower.includes(a.category.toLowerCase()))
  );

  if (matchedAgent) {
    const agentSignals = context.recentSignals.filter((s) => s.agentId === matchedAgent.id);

    let statusDescription = `Status is GREEN (Healthy). Operating normally within governance policy limits.`;
    if (matchedAgent.status === 'SUSPENDED') {
      statusDescription = `Status is SUSPENDED. Governance hold is active at the API gateway level due to: ${matchedAgent.holdReason || 'Safety Violation'}.`;
    } else if (matchedAgent.status === 'UNDER_REVIEW') {
      statusDescription = `Status is UNDER REVIEW. Open for compliance investigation due to: ${matchedAgent.holdReason || 'Model telemetry signal'}.`;
    } else if (matchedAgent.status === 'REMEDIATED') {
      statusDescription = `Status is REMEDIATED. Remediation verified; pending final approval to restore GREEN status.`;
    }

    let nextStep = `No action required. Continuous monitoring active.`;
    if (matchedAgent.status === 'SUSPENDED') {
      nextStep = `To resolve: Open the Review Queue and begin review (SUSPENDED -> UNDER_REVIEW). Direct restoration to GREEN is forbidden by state machine rules.`;
    } else if (matchedAgent.status === 'UNDER_REVIEW') {
      nextStep = `To resolve: Complete investigation and mark REMEDIATED in the Review Queue.`;
    } else if (matchedAgent.status === 'REMEDIATED') {
      nextStep = `To resolve: Click Restore to Green to restore production API access.`;
    }

    return {
      answer: `${matchedAgent.name} (${matchedAgent.id})\nCategory: ${matchedAgent.category}\n\n${statusDescription}\n\nRecent Signals (${agentSignals.length}):\n${agentSignals.length > 0 ? agentSignals.map(s => `- ${s.type} [${s.severity}]: ${s.metadata?.reason || 'Ingested signal'}`).join('\n') : '- No negative telemetry recorded.'}\n\nRecommended Action:\n${nextStep}`,
      source: 'Governance Chatbot'
    };
  }

  // 8. Suspended Agents Queries
  if (lower.includes('suspended') || lower.includes('hold') || lower.includes('blocked')) {
    const suspendedAgents = context.agents.filter((a) => a.status === 'SUSPENDED');

    if (suspendedAgents.length === 0) {
      return {
        answer: `There are currently no suspended agents. All AI models are either healthy or undergoing review.`,
        source: 'Governance Chatbot'
      };
    }

    return {
      answer: `Currently, ${suspendedAgents.length} agent is suspended:\n\n${suspendedAgents.map(a => `- ${a.name} (${a.id}): ${a.holdReason || 'Safety violation'}`).join('\n')}\n\nSuspended agents are blocked at the API level (returning HTTP 403 GOVERNANCE_HOLD). To resolve, go to the Review Queue and begin a compliance review.`,
      source: 'Governance Chatbot'
    };
  }

  // 9. SLA or 48-Hour Queries
  if (lower.includes('sla') || lower.includes('48') || lower.includes('hour')) {
    const breached = context.agents.filter(a => a.slaBreached);
    return {
      answer: `Under our compliance policy, any agent remaining in UNDER_REVIEW for more than 48 hours automatically breaches SLA and escalates to senior officers.\n\nCurrently, ${breached.length > 0 ? `${breached.length} agent has breached SLA (${breached.map(b => b.id).join(', ')})` : '0 agents have breached the 48-hour SLA'}.\n\nYou can use the "Simulate 50h SLA Breach" button on the Review Queue page to test SLA breach escalation during your demo.`,
      source: 'Governance Chatbot'
    };
  }

  // 10. General / Open Questions Fallback
  return {
    answer: `Regarding your query about "${userPrompt}":\n\nYour portfolio consists of 5 governed agents (${context.summary.greenCount} green, ${context.summary.underReviewCount} under review, ${context.summary.suspendedCount} suspended).\n\nIf you'd like to investigate a specific agent or incident, feel free to ask about any model such as Agent-001, Agent-002, or Agent-003!`,
    source: 'Governance Chatbot'
  };
}

/**
 * Handles Chatbot queries using Google Gemini SDK, OpenRouter API, or Chatbot Engine.
 */
async function queryCopilot(userPrompt, agentId = null) {
  const context = await assembleGovernanceContext(agentId);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const systemMessage = `You are the AI Governance Chatbot for an enterprise AI Control Center.
Your role is to assist the Governance and Compliance Team by answering user questions about agents, incidents, telemetry signals, root causes, compliance policies, and reviewer actions in a friendly, professional, conversational manner.
IMPORTANT: Do NOT include robotic boilerplate, templates, or repetitive portfolio summary headers. Simply answer the user's question directly and naturally.
IMPORTANT RULE: You DO NOT make governance decisions or status transitions yourself. Governance decisions are strictly executed by deterministic state machine logic. Your role is explanation, guidance, and human decision support.

Here is the exact live system governance state and context:
${JSON.stringify(context, null, 2)}`;

  // 1. Try Google Gemini API via SDK if API key is present and valid
  if (apiKey && apiKey.trim().length > 0 && !apiKey.startsWith('AQ.')) {
    const candidateModels = [
      process.env.LLM_MODEL || 'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp'
    ];

    for (const modelCandidate of candidateModels) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: modelCandidate });

        const fullPrompt = `${systemMessage}\n\nUser Question:\n${userPrompt}`;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        if (text && text.trim().length > 0) {
          return {
            answer: text,
            source: `Google Gemini LLM (${modelCandidate})`
          };
        }
      } catch (err) {
        console.warn(`[Chatbot] Gemini model '${modelCandidate}' call skipped: ${err.message}`);
      }
    }
  }

  // 2. Try OpenRouter API if OPENROUTER_API_KEY is present
  if (openRouterKey && openRouterKey.trim().length > 0) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://aigovernance.controlcenter',
          'X-Title': 'AI Governance Control Center'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content;
        if (answer) {
          return {
            answer,
            source: 'OpenRouter LLM (openai/gpt-4o-mini)'
          };
        }
      }
    } catch (err) {
      console.warn(`[Chatbot] OpenRouter API attempt failed: ${err.message}`);
    }
  }

  // 3. Conversational Fallback Responder
  return generateFallbackResponse(userPrompt, context);
}

module.exports = {
  assembleGovernanceContext,
  queryCopilot
};
