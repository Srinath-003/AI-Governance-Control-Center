import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, RefreshCw } from 'lucide-react';

export default function StatusBadge({ status, size = 'normal', showIcon = true }) {
  const isSmall = size === 'small';

  switch (status) {
    case 'GREEN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-full glow-green ${
            isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs tracking-wide'
          }`}
        >
          {showIcon && <ShieldCheck className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
          <span>HEALTHY (GREEN)</span>
        </span>
      );

    case 'UNDER_REVIEW':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold text-amber-400 bg-amber-950/60 border border-amber-500/30 rounded-full glow-amber ${
            isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs tracking-wide'
          }`}
        >
          {showIcon && <AlertTriangle className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
          <span>UNDER REVIEW</span>
        </span>
      );

    case 'SUSPENDED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold text-rose-300 bg-rose-950/80 border border-rose-500/50 rounded-full glow-red ${
            isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-xs tracking-wider'
          }`}
        >
          {showIcon && <AlertOctagon className={isSmall ? 'w-3.5 h-3.5 text-rose-400' : 'w-4 h-4 text-rose-400'} />}
          <span>SUSPENDED (HOLD)</span>
        </span>
      );

    case 'REMEDIATED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 rounded-full ${
            isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs tracking-wide'
          }`}
        >
          {showIcon && <RefreshCw className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
          <span>REMEDIATED</span>
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-slate-400 bg-slate-800 rounded-full">
          {status}
        </span>
      );
  }
}
