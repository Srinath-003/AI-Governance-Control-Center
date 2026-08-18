import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import { Shield, Play, Square, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isSimulating, startSimulation, stopSimulation } = useSimulation();

  return (
    <header className="h-16 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
            AI GOVERNANCE <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-normal">CONTROL CENTER</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono">Automated Production Monitoring → Governance Action Pipeline</p>
        </div>
      </div>

      {/* Center Controls: Simulation Engine */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium transition-all ${
          isSimulating 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 glow-green' 
            : 'bg-slate-900 text-slate-400 border-slate-800'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          <span>SIMULATION: {isSimulating ? 'RUNNING' : 'STOPPED'}</span>
        </div>

        {isSimulating ? (
          <button
            onClick={stopSimulation}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition"
          >
            <Square className="w-3.5 h-3.5" />
            Stop Simulation
          </button>
        ) : (
          <button
            onClick={startSimulation}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-900/40 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Monitoring Simulation
          </button>
        )}
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-200">{user.name}</div>
              <div className="text-[10px] text-indigo-400 font-mono">{user.role}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
