import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Terminal, Play, Lock, CheckCircle2, AlertOctagon, Send, Bot } from 'lucide-react';

export default function AgentTester() {
  const [searchParams] = useSearchParams();
  const initialAgent = searchParams.get('agent') || 'agent-003';

  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(initialAgent);
  const [prompt, setPrompt] = useState('Process high-value wire transfer request for account #9042');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/agents');
      setAgents(res.data.agents);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const currentAgent = agents.find((a) => a.agentId === selectedAgentId);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setResponse(null);
    setLoading(true);

    try {
      const res = await api.post(`/agents/${selectedAgentId}/request`, {
        prompt
      });
      setResponse({
        httpStatus: 200,
        data: res.data
      });
    } catch (err) {
      setResponse({
        httpStatus: err.response?.status || 500,
        data: err.response?.data || { error: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Terminal className="w-7 h-7 text-cyan-400" />
          Agent Request Enforcement Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Test live API request enforcement. Demonstrates that suspended agents return <code className="text-rose-400 font-mono">HTTP 403 GOVERNANCE_HOLD</code> at the backend server level.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Send className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-slate-100 text-base">Simulate External Application Request</h2>
          </div>

          <form onSubmit={handleSendRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target AI Agent
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => {
                  setSelectedAgentId(e.target.value);
                  setResponse(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono outline-none"
              >
                {agents.map((ag) => (
                  <option key={ag.agentId} value={ag.agentId}>
                    {ag.agentId} — {ag.name} ({ag.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Agent Quick Preview */}
            {currentAgent && (
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Selected Agent Status</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{currentAgent.name}</div>
                </div>
                <StatusBadge status={currentAgent.status} size="small" />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                User Request / Prompt Payload
              </label>
              <textarea
                rows="4"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt payload to test API response..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3.5 text-xs text-slate-100 font-mono outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition text-xs disabled:opacity-50"
            >
              {loading ? (
                <span>Executing API Gateway Request...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Send API Request to {selectedAgentId}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* API Response Output Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                Backend API Gateway Response
              </h2>
              {response && (
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-1 rounded ${
                    response.httpStatus === 200
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/40 glow-red'
                  }`}
                >
                  HTTP {response.httpStatus} {response.httpStatus === 200 ? 'OK' : 'FORBIDDEN'}
                </span>
              )}
            </div>

            {!response ? (
              <div className="py-16 text-center text-slate-500 font-mono text-xs space-y-2">
                <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
                <div>Select an agent and send a request to observe real-time enforcement.</div>
              </div>
            ) : response.httpStatus === 200 ? (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-emerald-200">Request Allowed</strong>
                    Agent status is healthy (GREEN). Request passed policy checks.
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Payload Output</span>
                  <pre className="text-xs font-mono text-emerald-400/90 whitespace-pre-wrap">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-xl flex items-start gap-3 text-rose-200 text-xs glow-red">
                  <Lock className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-100 text-sm font-bold">GOVERNANCE HOLD ENFORCED!</strong>
                    Backend API Gateway actively rejected the request with HTTP 403 Forbidden. Suspended agents are blocked at server level.
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-rose-950">
                  <span className="text-[10px] font-mono text-rose-400 uppercase block mb-1">Forbidden Response Payload</span>
                  <pre className="text-xs font-mono text-rose-300/90 whitespace-pre-wrap">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-800/80">
            Endpoint: <code className="text-cyan-400">POST /api/agents/{selectedAgentId}/request</code>
          </div>
        </div>
      </div>
    </div>
  );
}
