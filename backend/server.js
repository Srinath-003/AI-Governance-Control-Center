const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedData = require('./seed');

const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const signalRoutes = require('./routes/signals');
const governanceRoutes = require('./routes/governance');
const simulationRoutes = require('./routes/simulation');
const copilotRoutes = require('./routes/copilot');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AI Governance Control Center Backend API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/copilot', copilotRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize database and start server
async function startServer() {
  await connectDB();
  await seedData();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 AI Governance Control Center API running on port ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer();
