import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Bot, Search, ArrowUpRight, Activity, AlertCircle, Tag } from 'lucide-react';

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
          <div className="tag-purple">&lt; GOVERNED MODELS &gt;</div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
            <Bot className="w-7 h-7 text-purple-400" />
            Governed AI Agents Roster
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time governance status and telemetry compliance records across all active models.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-neutral-300 bg-[#0C0C0E] px-3.5 py-2 border border-[#222226]">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>ACTIVE AGENTS: {agents.length}</span>
        </div>
      </div>

      {/* Controls: Search and Filter Tabs (AIVAR Style) */}
      <div className="glass-panel p-4 bg-[#0C0C0E] border border-[#222226] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents by name, ID, or category..."
            className="w-full bg-[#030304] border border-[#222226] focus:border-purple-500 px-4 py-2.5 pl-10 text-xs text-white placeholder-neutral-500 outline-none font-mono transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'GREEN', 'UNDER_REVIEW', 'SUSPENDED', 'REMEDIATED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase transition ${
                statusFilter === st
                  ? 'bg-purple-600 text-white border border-purple-400 shadow-lg shadow-purple-950/50'
                  : 'bg-[#121215] text-neutral-400 hover:text-white border border-[#222226]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="py-12 text-center text-neutral-500 font-mono text-sm">
          Loading governed agent roster...
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="glass-panel p-12 bg-[#0C0C0E] border border-[#222226] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto" />
          <div className="text-sm font-bold text-neutral-300">No agents match your filter criteria</div>
          <p className="text-xs text-neutral-500">Try clearing your search query or selecting a different status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Link
              key={agent.agentId}
              to={`/agents/${agent.agentId}`}
              className="glass-card p-6 bg-[#0C0C0E] border border-[#222226] hover:border-purple-500/50 transition flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 border border-purple-500/30">
                      {agent.agentId}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition mt-2">
                      {agent.name}
                    </h3>
                  </div>
                  <StatusBadge status={agent.status} size="small" />
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                {/* Hold reason highlight if suspended */}
                {agent.status === 'SUSPENDED' && (
                  <div className="bg-rose-950/80 border border-rose-500/40 p-3 text-rose-200 text-[11px] leading-snug">
                    <strong>GOVERNANCE HOLD:</strong> {agent.holdReason || 'Safety violation detected.'}
                  </div>
                )}

                {/* SLA Breach Warning */}
                {agent.slaBreached && (
                  <div className="bg-amber-950/80 border border-amber-500/40 p-3 text-amber-300 text-[11px] font-bold font-mono">
                    ⚠️ 48-HOUR SLA BREACHED!
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="pt-4 mt-4 border-t border-[#222226] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{agent.category}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400 group-hover:translate-x-1 transition font-bold uppercase">
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
