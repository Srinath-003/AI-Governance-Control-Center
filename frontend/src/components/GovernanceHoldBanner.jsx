import React from 'react';
import { AlertOctagon, ShieldAlert, Lock } from 'lucide-react';

export default function GovernanceHoldBanner({ agent }) {
  if (!agent || agent.status !== 'SUSPENDED') return null;

  return (
    <div className="mb-6 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/80 via-red-950/50 to-slate-900/90 p-5 shadow-2xl backdrop-blur-md relative overflow-hidden glow-red">
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-rose-500/10 pointer-events-none">
        <AlertOctagon size={160} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400 shrink-0">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-rose-500 text-slate-950 px-2.5 py-0.5 rounded font-black text-xs tracking-wider uppercase">
                GOVERNANCE HOLD
              </span>
              <span className="text-xs font-mono text-rose-300/80">
                ENFORCED AT API GATEWAY
              </span>
            </div>
            <h3 className="text-lg font-bold text-rose-100 flex items-center gap-2">
              Agent Access Suspended Pending Compliance Review
            </h3>
            <p className="text-sm text-rose-200/90 mt-1 max-w-3xl leading-relaxed">
              <strong>Reason:</strong> {agent.holdReason || 'Critical Safety or Policy Violation triggered automated suspension.'}
            </p>
            <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-4 h-4" />
              State Machine Rule: Direct transition to GREEN is forbidden. Agent must be moved UNDER_REVIEW and REMEDIATED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
