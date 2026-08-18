import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { MessageSquare, Send, Shield, RefreshCw } from 'lucide-react';

export default function CopilotPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialAgent = searchParams.get('agent') || '';

  const [prompt, setPrompt] = useState(initialQuery);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState(initialAgent);

  const sampleQuestions = [
    "What is the current governance status of all agents?",
    "Why was Agent-003 placed on governance hold?",
    "Explain how model drift affects Agent-002",
    "What governance rules apply to safety violations?",
    "Show me the recent audit trail activity",
    "What happens when an agent breaches the 48-hour SLA?"
  ];

  useEffect(() => {
    if (initialQuery) {
      handleQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleQuery = async (queryText) => {
    const textToSubmit = queryText || prompt;
    if (!textToSubmit.trim()) return;

    const userMsg = { role: 'user', content: textToSubmit };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/copilot/chat', {
        prompt: textToSubmit,
        agentId: agentId || undefined
      });

      const assistantMsg = {
        role: 'assistant',
        content: res.data.answer,
        source: res.data.source
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `Error querying chatbot: ${err.message}`,
        source: 'System Error'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-purple-400" />
            AI Governance Chatbot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ask any question about agent status, incident root causes, telemetry signals, audit records, or compliance policies.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-500/30 px-3 py-1.5 rounded-xl font-mono text-xs text-purple-300 shrink-0">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Universal Governance Assistant</span>
        </div>
      </div>

      {/* Chat History Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 min-h-[420px] flex flex-col justify-between">
        {messages.length === 0 ? (
          <div className="my-auto py-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-900/30 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">How can I assist your compliance team today?</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Ask any question about your governed AI models, production signals, state machine transitions, or audit records.
              </p>
            </div>

            {/* Quick Sample Questions Chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto pt-2">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuery(q)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-purple-950/50 text-slate-300 hover:text-purple-200 text-xs font-medium rounded-xl border border-slate-800 hover:border-purple-500/40 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-3xl p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-950/40 font-medium'
                      : 'bg-slate-900/90 border border-purple-500/30 text-slate-200 rounded-bl-none shadow-xl'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-2">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Governance Chatbot
                      </span>
                      <span className="font-mono text-[10px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                        {msg.source}
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="bg-slate-900 p-3.5 rounded-2xl border border-purple-500/30 text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating system state and generating response...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              placeholder="Ask anything about AI governance, incidents, agent status, or policies..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
            <button
              onClick={() => handleQuery()}
              disabled={loading || !prompt.trim()}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-2 transition disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
