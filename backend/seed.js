const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Agent = require('./models/Agent');
const Signal = require('./models/Signal');
const AuditLog = require('./models/AuditLog');
const Incident = require('./models/Incident');

const DEFAULT_AGENTS = [
  {
    agentId: 'agent-001',
    name: 'Customer Support Agent',
    description: 'Autonomous agent answering customer tier-1 inquiries, processing refund checks, and handling account FAQs.',
    category: 'Customer Service',
    status: 'GREEN',
    version: '2.1.4',
    endpoint: '/api/v1/support-agent',
    incidentCount: 0
  },
  {
    agentId: 'agent-002',
    name: 'Resume Screening Agent',
    description: 'AI model rating incoming candidate CVs, matching skills against job specifications, and shortlisting applications.',
    category: 'HR & Recruitment',
    status: 'GREEN',
    version: '1.8.0',
    endpoint: '/api/v1/resume-screener',
    incidentCount: 0
  },
  {
    agentId: 'agent-003',
    name: 'Financial Assistant',
    description: 'RAG-powered conversational assistant for investment portfolio analysis, tax compliance checks, and transaction auditing.',
    category: 'Finance & Banking',
    status: 'GREEN',
    version: '3.0.1',
    endpoint: '/api/v1/fin-assistant',
    incidentCount: 0
  },
  {
    agentId: 'agent-004',
    name: 'Research Assistant',
    description: 'Deep web scraping and document summarization model for market intelligence and competitor analysis.',
    category: 'Market Intelligence',
    status: 'GREEN',
    version: '1.2.0',
    endpoint: '/api/v1/research-bot',
    incidentCount: 0
  },
  {
    agentId: 'agent-005',
    name: 'Recommendation Agent',
    description: 'Real-time personalized e-commerce recommendation engine driving homepage product carousels.',
    category: 'E-Commerce',
    status: 'GREEN',
    version: '4.5.2',
    endpoint: '/api/v1/recommender',
    incidentCount: 0
  }
];

async function seedData() {
  console.log('[Seed] Starting database seeding...');
  await connectDB();

  try {
    // 1. Seed Governance Team User
    const demoEmail = 'governance@demo.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      user = new User({
        name: 'Governance Lead',
        email: demoEmail,
        password: hashedPassword,
        role: 'Governance Team'
      });
      await user.save();
      console.log(`[Seed] Created default user: ${demoEmail} / demo123`);
    } else {
      console.log(`[Seed] Default user ${demoEmail} already exists.`);
    }

    // 2. Seed Agents
    for (const agentData of DEFAULT_AGENTS) {
      const existing = await Agent.findOne({ agentId: agentData.agentId });
      if (!existing) {
        await new Agent(agentData).save();
        console.log(`[Seed] Seeded Agent: ${agentData.agentId} (${agentData.name})`);

        // Create initial baseline audit entry
        await new AuditLog({
          eventId: `init_${agentData.agentId}`,
          agentId: agentData.agentId,
          signalType: 'BASELINE_INITIALIZATION',
          trigger: 'GOVERNANCE_POLICY_DEPLOYMENT',
          action: 'REGISTER_AGENT',
          previousStatus: 'GREEN',
          newStatus: 'GREEN',
          reviewer: 'SYSTEM_INITIALIZATION',
          reason: 'Initial registration and governance policy verification complete. Marked GREEN.'
        }).save();
      } else {
        console.log(`[Seed] Agent ${agentData.agentId} already present.`);
      }
    }

    console.log('[Seed] Database seeding finished successfully.');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  }
}

if (require.main === module) {
  seedData().then(() => mongoose.connection.close());
}

module.exports = seedData;
