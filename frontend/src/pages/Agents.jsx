import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Bot, Search, ArrowUpRight, Activity, AlertCircle, Clock, Tag } from 'lucide-react';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAgents();
    const timer = setInterval(fetchAgents, 3000);
    return () => clearInterval(timer);
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/agents');
      setAgents(res.data.agents);
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.agentId.toLowerCase().includes(search.toLowerCase()) ||
      agent.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bot className="w-7 h-7 text-indigo-400" />
            Governed AI Agents
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time governance status and telemetry compliance records across all active models.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Active Agents: {agents.length}</span>
        </div>
      </div>

      {/* Controls: Search and Filter Pills */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents by name or ID..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'GREEN', 'UNDER_REVIEW', 'SUSPENDED', 'REMEDIATED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 font-mono text-sm">
          Loading governed agent roster...
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="text-sm font-bold text-slate-300">No agents match your filter criteria</div>
          <p className="text-xs text-slate-500">Try clearing your search query or selecting a different status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => (
            <Link
              key={agent.agentId}
              to={`/agents/${agent.agentId}`}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                      {agent.agentId}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition mt-1">
                      {agent.name}
                    </h3>
                  </div>
                  <StatusBadge status={agent.status} size="small" />
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                {/* Hold reason highlight if suspended */}
                {agent.status === 'SUSPENDED' && (
                  <div className="bg-rose-950/80 border border-rose-500/40 p-2.5 rounded-lg text-rose-300 text-[11px] leading-snug">
                    <strong>GOVERNANCE HOLD:</strong> {agent.holdReason || 'Safety violation detected.'}
                  </div>
                )}

                {/* SLA Breach Warning */}
                {agent.slaBreached && (
                  <div className="bg-amber-950/80 border border-amber-500/40 p-2.5 rounded-lg text-amber-300 text-[11px] font-bold">
                    ⚠️ 48-HOUR GOVERNANCE SLA BREACHED!
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>{agent.category}</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-0.5 transition font-sans font-semibold">
                  <span>View Details</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
