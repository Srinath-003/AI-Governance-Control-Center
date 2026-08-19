import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import GovernanceHoldBanner from '../components/GovernanceHoldBanner';
import AuditDetailModal from '../components/AuditDetailModal';
import {
  Bot,
  Shield,
  Activity,
  History,
  ArrowLeft,
  Terminal,
  MessageSquare
} from 'lucide-react';

export default function AgentDetail() {
  const { agentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [remediationNotes, setRemediationNotes] = useState('');

  useEffect(() => {
    fetchDetail();
    const timer = setInterval(fetchDetail, 3000);
    return () => clearInterval(timer);
  }, [agentId]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/agents/${agentId}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching agent detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateTransition = async (actionType) => {
    setActionError('');
    setActionSuccess('');
    setSubmittingAction(true);

    try {
      let endpoint = '';
      if (actionType === 'review') endpoint = `/agents/${agentId}/review`;
      if (actionType === 'remediate') endpoint = `/agents/${agentId}/remediate`;
      if (actionType === 'restore') endpoint = `/agents/${agentId}/restore`;

      const res = await api.post(endpoint, {
        reason: remediationNotes || `Triggered manual ${actionType} governance action.`
      });

      setActionSuccess(res.data.message);
      setRemediationNotes('');
      await fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-slate-400 font-mono text-sm">
        Loading agent governance profile for {agentId}...
      </div>
    );
  }

  const { agent, signals = [], auditLogs = [], incidents = [] } = data;

  return (
    <div className="space-y-6">
      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/agents"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Governed Agents Roster
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/request-tester?agent=${agent.agentId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Test Request Enforcement
          </Link>

          <Link
            to={`/chatbot?q=Tell me about ${agent.agentId}&agent=${agent.agentId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 text-xs font-semibold text-purple-200 border border-purple-500/40 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
            Ask Governance Chatbot
          </Link>
        </div>
      </div>

      {/* Prominent Governance Hold Banner if SUSPENDED */}
      <GovernanceHoldBanner agent={agent} />

      {/* Action Messages */}
      {actionError && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-mono">
          <strong>STATE MACHINE REJECTION:</strong> {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-mono">
          <strong>SUCCESS:</strong> {actionSuccess}
        </div>
      )}

      {/* Agent Overview Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
            <Bot className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm sm:text-base font-black text-purple-300 bg-purple-950 px-3 py-1 rounded border border-purple-500/40">
                {agent.agentId}
              </span>
              <span className="text-xs font-mono text-neutral-400">v{agent.version}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white pt-1">{agent.name}</h1>
            <p className="text-xs text-slate-400 max-w-xl">{agent.description}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block mb-1">Current Governance Status</span>
            <StatusBadge status={agent.status} size="normal" />
          </div>
        </div>
      </div>

      {/* State Machine Action Controls Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Governance Action Controls (State Machine Enforced)
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Current State: <strong className="text-indigo-300">{agent.status}</strong>
          </span>
        </div>

        <div className="space-y-3">
          {agent.status === 'SUSPENDED' && (
            <div className="bg-slate-900/90 p-4 rounded-xl border border-rose-500/30 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                This agent is currently suspended. According to governance state machine rules, it <strong>cannot</strong> be directly restored to GREEN. It must first transition to <code className="text-amber-300 font-mono">UNDER_REVIEW</code>.
              </p>
              <button
                onClick={() => handleStateTransition('review')}
                disabled={submittingAction}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-900/40 transition disabled:opacity-50"
              >
                Begin Formal Compliance Review (SUSPENDED → UNDER_REVIEW)
              </button>
            </div>
          )}

          {agent.status === 'UNDER_REVIEW' && (
            <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Agent is under active compliance investigation. Complete remediation work before marking as <code className="text-cyan-300 font-mono">REMEDIATED</code>.
              </p>
              <input
                type="text"
                value={remediationNotes}
                onChange={(e) => setRemediationNotes(e.target.value)}
                placeholder="Optional remediation notes (e.g. Fine-tuned safety classifier & re-indexed vectors)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleStateTransition('remediate')}
                disabled={submittingAction}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-900/40 transition disabled:opacity-50"
              >
                Mark Remediation Complete (UNDER_REVIEW → REMEDIATED)
              </button>
            </div>
          )}

          {agent.status === 'REMEDIATED' && (
            <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/30 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Remediation has been verified. You may now restore production access to <code className="text-emerald-300 font-mono">GREEN</code>.
              </p>
              <button
                onClick={() => handleStateTransition('restore')}
                disabled={submittingAction}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition disabled:opacity-50"
              >
                Restore Production Access (REMEDIATED → GREEN)
              </button>
            </div>
          )}

          {agent.status === 'GREEN' && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Agent is healthy and meeting compliance requirements. Automated monitoring active.</span>
              <button
                onClick={() => handleStateTransition('review')}
                disabled={submittingAction}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg border border-slate-700 transition"
              >
                Open Manual Review
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Signal History & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ingested Signals */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Monitoring Signal Telemetry
            </h3>
            <span className="text-xs font-mono text-slate-500">{signals.length} Signals Ingested</span>
          </div>

          {signals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No monitoring signals recorded for this agent.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {signals.map((sig) => (
                <div
                  key={sig._id || sig.eventId}
                  className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-300">{sig.signalType}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        sig.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {sig.severity}
                    </span>
                  </div>
                  {sig.metadata?.reason && (
                    <p className="text-[11px] text-slate-400">{sig.metadata.reason}</p>
                  )}
                  <div className="text-[10px] font-mono text-slate-500 pt-1 flex items-center justify-between">
                    <span>Source: {sig.source || 'Monitoring Pipeline'}</span>
                    <span>{new Date(sig.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log Timeline */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Governance Transition Audit History
            </h3>
            <span className="text-xs font-mono text-slate-500">{auditLogs.length} Records</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No audit logs recorded for this agent.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log._id || log.eventId}
                  onClick={() => setSelectedAudit(log)}
                  className="bg-slate-900/80 hover:bg-slate-800/80 p-3 rounded-xl border border-slate-800 cursor-pointer transition text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">{log.action}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <StatusBadge status={log.previousStatus} size="small" showIcon={false} />
                    <span className="text-slate-500">→</span>
                    <StatusBadge status={log.newStatus} size="small" showIcon={false} />
                  </div>

                  <p className="text-slate-400 text-[11px] truncate">{log.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail view */}
      {selectedAudit && (
        <AuditDetailModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
      )}
    </div>
  );
}
