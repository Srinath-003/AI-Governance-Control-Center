# 🛡️ AI Governance Control Center

> **Enterprise AI Governance Platform**: Automatically converting AI production monitoring signals into deterministic governance actions and auditable state machine transitions.

---

## 🌟 Executive Summary

When an enterprise AI agent experiences a production failure (e.g. model concept drift, prompt injection, safety violation), standard engineering monitoring tools trigger developer alerts. The **AI Governance Control Center** automatically converts these production signals into **enforceable governance actions**—suspending agents at the API gateway level (`HTTP 403 GOVERNANCE_HOLD`), requiring formal compliance reviews, tracking 48-hour SLAs, and maintaining an immutable audit trail.

---

## 🏗️ Architecture & Pipeline Flow

```
[ Monitoring Signal Simulator / Prometheus / Webhooks ]
                         │
                         ▼ (POST /api/signals)
                [ Signal Ingester ]
                         │ (Normalization & Validation)
                         ▼
        [ Governance Trigger Classifier ]
  (Deterministic Rules: DRIFT -> REVIEW, SAFETY -> SUSPEND)
                         │
                         ▼
           [ Governance State Machine ]
    (Enforces Transition Matrix & Writes Audit Log)
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
 [ Database Storage ]          [ Agent Request API ]
 (Mongoose / MongoDB)          (Blocks SUSPENDED Agents)
                                          │
                                          ▼
                         [ LLM Governance Chatbot ]
                  (Contextual Explanations & Dialogue)
```

### State Machine Transition Matrix

| Current State | Target State | Allowed? | Trigger Source / Action |
|---|---|---|---|
| `GREEN` | `UNDER_REVIEW` | ✅ Allowed | Signal (`MODEL_DRIFT`, `ERROR_RATE_SPIKE`, `PERFORMANCE_DEGRADATION`) or Manual |
| `GREEN` | `SUSPENDED` | ✅ Allowed | Critical Signal (`SAFETY_VIOLATION`) or Manual |
| `UNDER_REVIEW` | `REMEDIATED` | ✅ Allowed | Compliance Reviewer Action |
| `UNDER_REVIEW` | `SUSPENDED` | ✅ Allowed | High Severity Signal or Escalation |
| `SUSPENDED` | `UNDER_REVIEW` | ✅ Allowed | Compliance Reviewer Action (Begins Review) |
| `SUSPENDED` | `GREEN` | ❌ **FORBIDDEN** | Direct restoration strictly blocked by State Machine |
| `REMEDIATED` | `GREEN` | ✅ Allowed | Compliance Reviewer Approval (Restores Access) |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, React Router v6
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs
- **Database**: MongoDB Atlas / Mongoose (with automatic `mongodb-memory-server` fallback)
- **LLM Integration**: Google Gemini API (`@google/generative-ai` SDK) & OpenRouter API
- **Infrastructure**: Docker, Docker Compose, Nginx

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env` in both backend and frontend directories:

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai_governance
JWT_SECRET=ai_governance_secret_key_demo_2026
GEMINI_API_KEY=AIzaSy... (Get key from https://aistudio.google.com/app/apikey)
OPENROUTER_API_KEY=
LLM_MODEL=gemini-1.5-flash
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
# For local dev proxy: /api
# For production deployment: https://your-backend-api-domain.com/api
VITE_API_BASE_URL=/api
```

---

## 🚀 Quick Start & Installation

### Option 1: Local Development

```bash
# 1. Start Backend
cd backend
npm install
npm start

# 2. In a separate terminal, start Frontend
cd frontend
npm install
npm run dev
```

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000`

---

### Option 2: Docker Compose Deployment

```bash
docker-compose up --build
```

---

## 🔑 Demo Account Credentials

- **Email**: `governance@demo.com`
- **Password**: `demo123` *(Click **Auto-fill** on login page)*

---

## 🎯 Step-by-Step Hackathon Demo Script

1. **Login**: Log in as `governance@demo.com` / `demo123`.
2. **Dashboard Overview**: Observe all 5 AI Agents (`Agent-001` through `Agent-005`).
3. **Start Simulation**: Click **"Start Monitoring Simulation"** in the top navigation bar.
4. **Model Drift Trigger**: Watch `Agent-002` transition `GREEN → UNDER_REVIEW` as a `MODEL_DRIFT` signal arrives.
5. **Safety Violation Trigger**: Watch `Agent-003` transition `GREEN → SUSPENDED` as a `SAFETY_VIOLATION` signal arrives.
6. **Test Request Enforcement**:
   - Open **Request Tester** in the sidebar.
   - Select `Agent-001` (GREEN) → Returns `HTTP 200 OK`.
   - Select `Agent-003` (SUSPENDED) → Returns `HTTP 403 GOVERNANCE_HOLD` (Blocked at server level).
7. **Query Governance Chatbot**:
   - Open **Chatbot** in the sidebar.
   - Ask any conversational question e.g. *"Why was Agent-003 suspended?"* or *"What does remediated mean?"*.
8. **Review Queue & SLA Fast-Forward**:
   - Open **Review Queue** and click **"Simulate 50h SLA Breach"** to view 48h SLA escalation.
9. **State Machine Compliance Workflow**:
   - Move `Agent-003`: `SUSPENDED` → `UNDER_REVIEW` → `REMEDIATED` → `GREEN`.
10. **Audit Trail Inspection**: View immutable event logs in **Audit Trail**.

---

## 🌐 Production Deployment Guide

### Deploying Frontend (Vercel / Netlify / Render Static)
1. Set Build Command: `npm run build`
2. Set Output Directory: `dist`
3. Set Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

### Deploying Backend (Render / Railway / Fly.io)
1. Set Root Directory: `backend`
2. Set Build Command: `npm install`
3. Set Start Command: `node server.js`
4. Set Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`

---

## 📄 License

MIT License • Developed for Enterprise AI Governance & Demonstration.
