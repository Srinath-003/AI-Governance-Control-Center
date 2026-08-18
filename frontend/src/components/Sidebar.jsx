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
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/agents', label: 'Governed Agents', icon: Bot },
    { path: '/review-queue', label: 'Review Queue', icon: ClipboardList },
    { path: '/audit', label: 'Audit Trail', icon: History },
    { path: '/request-tester', label: 'Request Tester', icon: Terminal },
    { path: '/chatbot', label: 'Governance Chatbot', icon: MessageSquare, highlight: true }
  ];

  return (
    <aside className="w-64 bg-[#050505] border-r border-[#222226] fixed top-16 bottom-0 left-0 z-30 p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        <div>
          <div className="tag-purple px-2 mb-3">
            &lt; NAVIGATION &gt;
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
                    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-mono font-bold uppercase transition-all tracking-wider ${
                      isActive
                        ? 'bg-purple-950/40 text-white border-l-4 border-purple-500 bg-gradient-to-r from-purple-900/30 to-transparent'
                        : 'text-neutral-400 hover:text-white hover:bg-[#121215] border-l-4 border-transparent'
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

        {/* State Machine Info Box - AIVAR Style */}
        <div className="p-4 bg-[#0C0C0E] border border-[#222226] text-xs text-neutral-400 space-y-2 font-mono">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            &lt; ENFORCEMENT ENGINE &gt;
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-300">
            Strict State Machine Rule Enforcement:
          </p>
          <div className="text-[10px] bg-[#030304] p-2 border border-[#222226] text-purple-300 font-bold">
            SUSPENDED → UNDER_REVIEW → REMEDIATED → GREEN
          </div>
          <p className="text-[10px] text-rose-400 font-bold">
            ❌ Direct SUSPENDED → GREEN strictly forbidden.
          </p>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-[#222226] text-[10px] text-neutral-500 text-center font-mono uppercase tracking-wider">
        AI Governance • Hackathon Edition
      </div>
    </aside>
  );
}
