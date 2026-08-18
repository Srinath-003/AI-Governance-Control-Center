import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import {
  Bot,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Play,
  Square,
  Activity,
  ArrowRight,
  Clock,
  FileSpreadsheet
} from 'lucide-react';

export default function Dashboard() {
  const { stats, loadingStats, isSimulating, startSimulation, stopSimulation } = useSimulation();

  if (loadingStats || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-indigo-400 font-mono text-sm">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Loading Governance Telemetry...</span>
        </div>
      </div>
    );
  }

  const { summary, recentIncidents = [], recentActions = [] } = stats;

  return (
    <div className="space-y-6">
      {/* Simulation Banner Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full">
              LIVE MONITORING ENGINE
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Auto-Polling active • Signals → Governance Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Governance Control Room</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Real-time automated conversion of production monitoring telemetry (model drift, safety breaches, guardrail blocks) into deterministic governance actions and auditable state machine transitions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          {isSimulating ? (
            <button
              onClick={stopSimulation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 transition"
            >
              <Square className="w-4 h-4" />
              Stop Simulation
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/40 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Monitoring Simulation
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Agents */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Agents</div>
            <div className="text-2xl font-black text-white mt-1">{summary.total}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Governed Portfolio</div>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        {/* Healthy Green */}
        <div className="glass-card p-4 rounded-xl border border-emerald-900/40 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Healthy (Green)</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{summary.green}</div>
            <div className="text-[10px] text-emerald-500/80 font-mono mt-0.5">Active Production</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Under Review */}
        <div className="glass-card p-4 rounded-xl border border-amber-900/40 flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Under Review</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{summary.underReview}</div>
            <div className="text-[10px] text-amber-500/80 font-mono mt-0.5">Compliance Queue</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Suspended */}
        <div className="glass-card p-4 rounded-xl border border-rose-900/50 flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Suspended</div>
            <div className="text-2xl font-black text-rose-200 mt-1">{summary.suspended}</div>
            <div className="text-[10px] text-rose-400 font-mono mt-0.5">Governance Hold</div>
          </div>
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400 glow-red">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Remediated */}
        <div className="glass-card p-4 rounded-xl border border-cyan-900/40 flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Remediated</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{summary.remediated}</div>
            <div className="text-[10px] text-cyan-500/80 font-mono mt-0.5">Pending Restoration</div>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Governance Events & Audit Log Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Governance Incidents */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-slate-100 text-base">Recent Governance Incidents</h2>
            </div>
            <Link to="/review-queue" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold">
              View Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentIncidents.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              No active governance incidents. All agents healthy.
            </div>
          ) : (
            <div className="space-y-3">
              {recentIncidents.map((incident) => (
                <div
                  key={incident.incidentId}
                  className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-300">{incident.agentId}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          incident.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-200">{incident.title}</div>
                    <p className="text-xs text-slate-400 line-clamp-2">{incident.description}</p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Governance Actions & Audit Entries */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-slate-100 text-base">Recent Governance Actions</h2>
            </div>
            <Link to="/audit" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold">
              Full Audit Trail <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentActions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              No audit actions logged yet. Start simulation to generate telemetry.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActions.slice(0, 5).map((action) => (
                <div
                  key={action._id || action.eventId}
                  className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-300">{action.agentId}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-indigo-300 font-semibold">{action.action}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(action.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400">Transition:</span>
                    <StatusBadge status={action.previousStatus} size="small" showIcon={false} />
                    <span className="text-slate-500">→</span>
                    <StatusBadge status={action.newStatus} size="small" showIcon={false} />
                  </div>

                  <div className="text-slate-400 text-[11px] truncate">
                    Reason: <span className="text-slate-300">{action.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
