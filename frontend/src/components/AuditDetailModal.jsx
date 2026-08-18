import React from 'react';
import { X, ShieldCheck, Clock, UserCheck, FileText, ArrowRight, Tag } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function AuditDetailModal({ audit, onClose }) {
  if (!audit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Audit Trail Record</h3>
              <p className="text-xs font-mono text-slate-400">Event ID: {audit.eventId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status Transition Row */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-around text-center">
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">Previous Status</span>
              <StatusBadge status={audit.previousStatus} size="small" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500" />
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">New Status</span>
              <StatusBadge status={audit.newStatus} size="small" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Agent ID
              </span>
              <span className="text-sm font-semibold text-slate-200">{audit.agentId}</span>
            </div>

            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                <Tag className="w-3.5 h-3.5 text-cyan-400" /> Signal Type
              </span>
              <span className="text-sm font-semibold text-cyan-300">{audit.signalType}</span>
            </div>

            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Reviewer / Actor
              </span>
              <span className="text-sm font-semibold text-slate-200">{audit.reviewer}</span>
            </div>

            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Timestamp
              </span>
              <span className="text-xs font-mono text-slate-300">
                {new Date(audit.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action & Trigger */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Governance Action</span>
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <div className="text-sm font-semibold text-indigo-300">{audit.action}</div>
              <div className="text-xs text-slate-400 mt-1">Trigger: <code className="text-amber-300 font-mono">{audit.trigger}</code></div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" /> Audit Rationale
            </span>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans">
              {audit.reason}
            </div>
          </div>

          {/* Metadata JSON if available */}
          {audit.metadata && Object.keys(audit.metadata).length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Metadata Payload</span>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400/90 overflow-x-auto">
                {JSON.stringify(audit.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
}
