import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  ClipboardList,
  History,
  Terminal,
  MessageSquare
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
    <aside className="w-64 bg-[#050505] border-r border-[#222226] fixed top-[72px] bottom-0 left-0 z-30 p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        <div>
          <div className="tag-purple px-2 mb-3 text-xs font-bold uppercase tracking-widest">
            NAVIGATION
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
                    `flex items-center gap-3 px-3.5 py-3 text-sm font-mono font-bold uppercase transition-all tracking-wider rounded-xl ${
                      isActive
                        ? 'bg-purple-950/70 text-white border-l-4 border-purple-500 bg-gradient-to-r from-purple-900/40 to-transparent'
                        : 'text-neutral-300 hover:text-white hover:bg-[#121215] border-l-4 border-transparent'
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
      </div>

      {/* Clean Footer info */}
      <div className="pt-4 border-t border-[#222226] text-xs text-neutral-400 text-center font-mono uppercase tracking-wider">
        AI Governance • Control Center
      </div>
    </aside>
  );
}
