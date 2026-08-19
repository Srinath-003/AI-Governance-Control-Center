import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle,
  FastForward,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export default function ReviewQueue() {
  const [queueAgents, setQueueAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [fastForwarding, setFastForwarding] = useState(false);

  useEffect(() => {
    fetchQueue();
    const timer = setInterval(fetchQueue, 3000);
    return () => clearInterval(timer);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/agents');
      // Queue includes agents requiring governance attention (SUSPENDED, UNDER_REVIEW, REMEDIATED)
      const needingAttention = res.data.agents.filter(
        (a) => a.status !== 'GREEN' || a.slaBreached
      );
      setQueueAgents(needingAttention);
    } catch (err) {
      console.error('Error fetching review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (agentId, targetAction) => {
    setActionMessage({ type: '', text: '' });
    try {
      let endpoint = '';
      if (targetAction === 'review') endpoint = `/agents/${agentId}/review`;
      if (targetAction === 'remediate') endpoint = `/agents/${agentId}/remediate`;
      if (targetAction === 'restore') endpoint = `/agents/${agentId}/restore`;

      const res = await api.post(endpoint, {
        reason: `Governance Team executed ${targetAction} from Review Queue workflow.`
      });

      setActionMessage({ type: 'success', text: res.data.message });
      await fetchQueue();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.error || err.message
      });
    }
  };

  const handleFastForwardSLA = async (agentId) => {
    setFastForwarding(true);
    setActionMessage({ type: '', text: '' });
    try {
      const res = await api.post('/governance/sla/fast-forward', { agentId });
      setActionMessage({
        type: 'success',
        text: `⚡ Fast-Forward Successful: ${res.data.message}`
      });
      await fetchQueue();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.error || err.message
      });
    } finally {
      setFastForwarding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header & SLA Feature Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-amber-400" />
            Governance Review Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Active compliance review tasks requiring human oversight, SLA tracking, and state machine transition execution.
          </p>
        </div>

        {/* SLA Fast-Forward Demo Trigger */}
        <button
          onClick={() => handleFastForwardSLA()}
          disabled={fastForwarding}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-900/40 border border-amber-400/30 transition shrink-0"
        >
          <FastForward className="w-4 h-4" />
          <span>Simulate 50h SLA Breach (Demo Acceleration)</span>
        </button>
      </div>

      {/* Action Notification Messages */}
      {actionMessage.text && (
        <div
          className={`p-4 rounded-xl text-xs font-mono border ${
            actionMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* SLA Rule Explanation Card */}
      <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 flex items-start gap-3 text-xs text-slate-300">
        <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">48-Hour Governance SLA Policy:</strong> Agents remaining in <code className="text-amber-400 font-mono">UNDER_REVIEW</code> status for more than 48 hours without remediation automatically breach compliance SLA and are escalated to Senior Compliance Officers. Click <strong>"Simulate 50h SLA Breach"</strong> above to test SLA breach escalation instantly.
        </div>
      </div>

      {/* Queue Roster */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 font-mono text-sm">
          Loading governance review queue...
        </div>
      ) : queueAgents.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Review Queue Empty!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All AI agents are currently healthy and compliant (GREEN). Start the Monitoring Simulation on the dashboard to generate signals.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queueAgents.map((agent) => (
            <div
              key={agent.agentId}
              className={`glass-panel p-5 rounded-2xl border transition space-y-4 ${
                agent.slaBreached
                  ? 'border-amber-500/60 bg-amber-950/20'
                  : agent.status === 'SUSPENDED'
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : 'border-slate-800'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-sm font-black text-purple-300 bg-purple-950 px-3 py-1 rounded border border-purple-500/40 shrink-0">
                    {agent.agentId}
                  </span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl sm:text-2xl font-black text-white">{agent.name}</h3>
                      <StatusBadge status={agent.status} size="normal" />
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">{agent.description}</p>
                  </div>
                </div>

                {/* SLA Status Indicator */}
                <div className="flex items-center gap-3">
                  {agent.slaBreached ? (
                    <span className="px-3.5 py-1.5 bg-amber-500 text-slate-950 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase glow-amber flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> SLA BREACHED (50h+)
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-[#121215] text-neutral-300 border border-[#222226] rounded-full text-xs sm:text-sm font-mono flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" /> SLA OK (&lt; 48h)
                    </span>
                  )}
                </div>
              </div>

              {/* Incident Details & Last Signal */}
              <div className="bg-[#050505] p-4 rounded-xl border border-[#222226] text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 text-xs uppercase font-mono font-bold block mb-0.5">Hold / Incident Reason</span>
                  <span className="text-white font-medium">
                    {agent.holdReason || agent.lastSignalType || 'Under compliance reassessment.'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 text-xs uppercase font-mono font-bold block mb-0.5">Review Started</span>
                  <span className="text-neutral-300 font-mono">
                    {agent.reviewStartedAt
                      ? new Date(agent.reviewStartedAt).toLocaleString()
                      : 'Pending review start'}
                  </span>
                </div>
              </div>

              {/* State Machine Transition Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#222226]">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/agents/${agent.agentId}`}
                    className="text-sm text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                  >
                    View Agent Details <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-neutral-600">•</span>
                  <Link
                    to={`/chatbot?q=What caused ${agent.agentId} to be placed in review queue?&agent=${agent.agentId}`}
                    className="text-sm text-purple-300 hover:text-white font-bold flex items-center gap-1"
                  >
                    <MessageSquare className="w-4 h-4" /> Ask Chatbot
                  </Link>
                </div>

                {/* Workflow Buttons */}
                <div className="flex items-center gap-2">
                  {agent.status === 'SUSPENDED' && (
                    <button
                      onClick={() => handleTransition(agent.agentId, 'review')}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition"
                    >
                      Begin Review (SUSPENDED → UNDER_REVIEW)
                    </button>
                  )}

                  {agent.status === 'UNDER_REVIEW' && (
                    <button
                      onClick={() => handleTransition(agent.agentId, 'remediate')}
                      className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition"
                    >
                      Mark Remediated (UNDER_REVIEW → REMEDIATED)
                    </button>
                  )}

                  {agent.status === 'REMEDIATED' && (
                    <button
                      onClick={() => handleTransition(agent.agentId, 'restore')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
                    >
                      Restore to Green (REMEDIATED → GREEN)
                    </button>
                  )}

                  {agent.status === 'UNDER_REVIEW' && !agent.slaBreached && (
                    <button
                      onClick={() => handleFastForwardSLA(agent.agentId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs rounded-lg border border-amber-500/30 transition"
                    >
                      Fast-Forward SLA (50h)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
