import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import AuditDetailModal from '../components/AuditDetailModal';
import { History, Search, Filter, ShieldCheck, Download, Eye, Tag } from 'lucide-react';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('');
  const [signalFilter, setSignalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAudit, setSelectedAudit] = useState(null);

  useEffect(() => {
    fetchAuditLogs();
    const timer = setInterval(fetchAuditLogs, 3000);
    return () => clearInterval(timer);
  }, [agentFilter, signalFilter, statusFilter]);

  const fetchAuditLogs = async () => {
    try {
      const params = {};
      if (agentFilter) params.agentId = agentFilter;
      if (signalFilter) params.signalType = signalFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/governance/audit', { params });
      setLogs(res.data.logs);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-indigo-400" />
            Governance Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable, queryable audit records of all incoming signals, rule engine triggers, and state machine transitions.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Total Audit Logs: {logs.length}</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Filter by Agent</label>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="">All Governed Agents</option>
            <option value="agent-001">Agent-001 (Customer Support)</option>
            <option value="agent-002">Agent-002 (Resume Screener)</option>
            <option value="agent-003">Agent-003 (Financial Assistant)</option>
            <option value="agent-004">Agent-004 (Research Assistant)</option>
            <option value="agent-005">Agent-005 (Recommendation)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Filter by Signal Type</label>
          <select
            value={signalFilter}
            onChange={(e) => setSignalFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="">All Signal Types</option>
            <option value="MODEL_DRIFT">MODEL_DRIFT</option>
            <option value="SAFETY_VIOLATION">SAFETY_VIOLATION</option>
            <option value="GUARDRAIL_BLOCK">GUARDRAIL_BLOCK</option>
            <option value="ERROR_RATE_SPIKE">ERROR_RATE_SPIKE</option>
            <option value="PERFORMANCE_DEGRADATION">PERFORMANCE_DEGRADATION</option>
            <option value="SLA_BREACH">SLA_BREACH</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Filter by Target Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
          >
            <option value="">All Status Transitions</option>
            <option value="GREEN">GREEN</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="REMEDIATED">REMEDIATED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#121215] border-b border-[#222226] text-purple-300 font-mono text-xs sm:text-sm uppercase tracking-wider">
                <th className="py-4 px-4">Timestamp</th>
                <th className="py-4 px-4">Agent</th>
                <th className="py-4 px-4">Signal Type</th>
                <th className="py-4 px-4">Governance Action</th>
                <th className="py-4 px-4 text-center">Status Transition</th>
                <th className="py-4 px-4">Actor</th>
                <th className="py-4 px-4">Rationale</th>
                <th className="py-4 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222226]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-neutral-400 font-mono text-sm">
                    Loading audit trail entries...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-neutral-400 font-mono text-sm">
                    No matching audit trail records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id || log.eventId}
                    className="hover:bg-[#121215]/80 transition group cursor-pointer"
                    onClick={() => setSelectedAudit(log)}
                  >
                    <td className="py-3.5 px-4 font-mono text-xs sm:text-sm text-neutral-300 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs sm:text-sm font-black text-purple-300 bg-purple-950 px-2.5 py-1 rounded border border-purple-500/40 whitespace-nowrap inline-block">
                        {log.agentId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300">{log.signalType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <StatusBadge status={log.previousStatus} size="normal" showIcon={false} />
                        <span className="text-neutral-500">→</span>
                        <StatusBadge status={log.newStatus} size="normal" showIcon={false} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 font-mono text-xs sm:text-sm">
                      {log.reviewer}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-200 text-xs sm:text-sm max-w-xs truncate">
                      {log.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAudit(log);
                        }}
                        className="p-2 rounded bg-[#121215] hover:bg-purple-600 text-neutral-300 hover:text-white transition border border-[#222226]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail View */}
      {selectedAudit && (
        <AuditDetailModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
      )}
    </div>
  );
}
