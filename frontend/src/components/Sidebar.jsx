import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  ClipboardList,
  History,
  Terminal,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Governance Dashboard', icon: LayoutDashboard },
    { path: '/agents', label: 'Governed Agents', icon: Bot },
    { path: '/review-queue', label: 'Review Queue', icon: ClipboardList },
    { path: '/audit', label: 'Audit Trail', icon: History },
    { path: '/request-tester', label: 'Request Tester', icon: Terminal },
    { path: '/chatbot', label: 'Chatbot', icon: MessageSquare, highlight: true }
  ];

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-slate-800/80 fixed top-16 bottom-0 left-0 z-30 p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 font-mono">
            Navigation Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? item.highlight
                          ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white border border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                          : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                        : item.highlight
                        ? 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/40 border border-purple-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-purple-400' : ''}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* State Machine Info Box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase font-mono">
            <ShieldCheck className="w-4 h-4" />
            Deterministic Engine
          </div>
          <p className="text-[11px] leading-relaxed">
            Status changes enforce strict state machine graph rules:
          </p>
          <div className="font-mono text-[10px] bg-slate-950 p-2 rounded border border-slate-800 text-slate-300">
            SUSPENDED → UNDER_REVIEW → REMEDIATED → GREEN
          </div>
          <p className="text-[10px] text-rose-400 font-medium">
            ❌ Direct SUSPENDED → GREEN is forbidden.
          </p>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
        AI Governance v1.0.0 • Hackathon Edition
      </div>
    </aside>
  );
}
