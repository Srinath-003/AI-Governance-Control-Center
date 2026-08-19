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
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-purple-400" />
            AI Governance Chatbot
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Ask any question about agent status, incident root causes, telemetry signals, audit records, or compliance policies.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-500/40 px-4 py-2 rounded-xl font-mono text-xs sm:text-sm font-bold text-purple-300 shrink-0">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Universal Governance Assistant</span>
        </div>
      </div>

      {/* Chat History Container */}
      <div className="glass-panel rounded-2xl border border-[#222226] p-6 space-y-4 min-h-[450px] flex flex-col justify-between bg-[#0C0C0E]">
        {messages.length === 0 ? (
          <div className="my-auto py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">How can I assist your compliance team today?</h3>
              <p className="text-sm text-neutral-400 max-w-md mx-auto mt-1">
                Ask any question about your governed AI models, production signals, state machine transitions, or audit records.
              </p>
            </div>

            {/* Quick Sample Questions Chips */}
            <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto pt-3">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuery(q)}
                  className="px-4 py-2.5 bg-[#121215] hover:bg-purple-950/60 text-neutral-200 hover:text-white text-xs sm:text-sm font-medium rounded-xl border border-[#222226] hover:border-purple-500/40 transition shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-3xl p-4 rounded-2xl text-sm sm:text-base leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none shadow-lg shadow-purple-950/40 font-medium'
                      : 'bg-[#121215] border border-purple-500/30 text-neutral-100 rounded-bl-none shadow-xl'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-2">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs sm:text-sm">
                        <MessageSquare className="w-4 h-4" /> Governance Chatbot
                      </span>
                      <span className="font-mono text-xs text-purple-300 bg-purple-950 px-2.5 py-0.5 rounded border border-purple-500/40">
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
                <div className="bg-[#121215] p-4 rounded-2xl border border-purple-500/30 text-sm text-purple-300 flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating system state and generating response...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="pt-3 border-t border-[#222226]">
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              placeholder="Ask anything about AI governance, incidents, agent status, or policies..."
              className="flex-1 bg-[#050505] border border-[#222226] focus:border-purple-500 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder-neutral-500 outline-none transition"
            />
            <button
              onClick={() => handleQuery()}
              disabled={loading || !prompt.trim()}
              className="px-6 py-3.5 btn-notch-purple text-sm rounded-xl flex items-center gap-2 transition disabled:opacity-50 shrink-0 font-bold"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
