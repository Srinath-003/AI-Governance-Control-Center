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
        <div className="flex items-center gap-3 text-purple-400 font-mono text-sm">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Loading Governance Telemetry...</span>
        </div>
      </div>
    );
  }

  const { summary, recentIncidents = [], recentActions = [] } = stats;

  return (
    <div className="space-y-8">
      {/* AIVAR Hero Banner Header */}
      <div className="glass-panel p-8 bg-[#0C0C0E] border border-[#222226] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden bg-purple-grid">
        <div className="space-y-4 max-w-3xl relative z-10">
          <div className="tag-purple">
            &lt; SERVICES THAT SCALE LIKE SOFTWARE &gt;
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
            Enterprise AI That Finally Earns Its Place In Production
          </h1>
          <p className="text-sm text-neutral-300 font-medium leading-relaxed max-w-2xl">
            Deployed Faster. Governed Tighter. Proven outcomes. Automatically converting AI production monitoring signals into deterministic governance actions and auditable state machine transitions.
          </p>

          {/* Notched Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isSimulating ? (
              <button
                onClick={stopSimulation}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs uppercase tracking-wider transition border border-rose-400/30 flex items-center gap-2"
              >
                <Square className="w-4 h-4 fill-current" />
                Stop Simulation
              </button>
            ) : (
              <button
                onClick={startSimulation}
                className="px-6 py-3 btn-notch-white text-xs flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Monitoring Simulation
              </button>
            )}

            <Link
              to="/review-queue"
              className="px-6 py-3 btn-notch-outline text-xs flex items-center gap-2"
            >
              See Review Queue
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row - AIVAR High-Contrast Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Agents */}
        <div className="glass-card p-5 bg-[#0C0C0E] border border-[#222226] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">&lt; PORTFOLIO &gt;</div>
            <div className="text-3xl font-black text-white mt-1 font-mono">{summary.total}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Total Governed</div>
          </div>
          <div className="p-3 bg-purple-950/40 border border-purple-500/30 text-purple-400">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        {/* Healthy Green */}
        <div className="glass-card p-5 bg-[#0C0C0E] border border-emerald-900/50 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">&lt; HEALTHY &gt;</div>
            <div className="text-3xl font-black text-emerald-400 mt-1 font-mono">{summary.green}</div>
            <div className="text-[11px] text-emerald-500/80 mt-0.5">Active Production</div>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Under Review */}
        <div className="glass-card p-5 bg-[#0C0C0E] border border-amber-900/50 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">&lt; REVIEW &gt;</div>
            <div className="text-3xl font-black text-amber-300 mt-1 font-mono">{summary.underReview}</div>
            <div className="text-[11px] text-amber-500/80 mt-0.5">Compliance Queue</div>
          </div>
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Suspended */}
        <div className="glass-card p-5 bg-[#0C0C0E] border border-rose-900/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-rose-400 uppercase tracking-widest">&lt; HOLD &gt;</div>
            <div className="text-3xl font-black text-rose-300 mt-1 font-mono">{summary.suspended}</div>
            <div className="text-[11px] text-rose-400/80 mt-0.5">Suspended Access</div>
          </div>
          <div className="p-3 bg-rose-950/50 border border-rose-500/40 text-rose-400 glow-red">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Remediated */}
        <div className="glass-card p-5 bg-[#0C0C0E] border border-cyan-900/50 flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">&lt; REMEDIATED &gt;</div>
            <div className="text-3xl font-black text-cyan-300 mt-1 font-mono">{summary.remediated}</div>
            <div className="text-[11px] text-cyan-500/80 mt-0.5">Ready for Green</div>
          </div>
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Governance Events & Audit Log Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Governance Incidents */}
        <div className="glass-panel p-6 bg-[#0C0C0E] border border-[#222226] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">Recent Governance Incidents</h2>
            </div>
            <Link to="/review-queue" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono font-bold uppercase">
              Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentIncidents.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs font-mono">
              No active governance incidents. All agents healthy.
            </div>
          ) : (
            <div className="space-y-3">
              {recentIncidents.map((incident) => (
                <div
                  key={incident.incidentId}
                  className="bg-[#121215] p-4 border border-[#222226] hover:border-purple-500/40 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-400">{incident.agentId}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          incident.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{incident.title}</div>
                    <p className="text-xs text-neutral-400 line-clamp-2">{incident.description}</p>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Governance Actions & Audit Entries */}
        <div className="glass-panel p-6 bg-[#0C0C0E] border border-[#222226] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-400" />
              <h2 className="font-bold text-white text-base">Recent Governance Actions</h2>
            </div>
            <Link to="/audit" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono font-bold uppercase">
              Full Audit Trail <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentActions.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs font-mono">
              No audit actions logged yet. Start simulation to generate telemetry.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActions.slice(0, 5).map((action) => (
                <div
                  key={action._id || action.eventId}
                  className="bg-[#121215] p-4 border border-[#222226] text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-400">{action.agentId}</span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-white font-semibold">{action.action}</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500">
                      {new Date(action.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-neutral-400 font-mono">Transition:</span>
                    <StatusBadge status={action.previousStatus} size="small" showIcon={false} />
                    <span className="text-neutral-500">→</span>
                    <StatusBadge status={action.newStatus} size="small" showIcon={false} />
                  </div>

                  <div className="text-neutral-400 text-[11px] truncate">
                    Reason: <span className="text-neutral-300">{action.reason}</span>
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
