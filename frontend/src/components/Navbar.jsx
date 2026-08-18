import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import { Play, Square, LogOut, Hexagon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isSimulating, startSimulation, stopSimulation } = useSimulation();

  return (
    <header className="h-18 bg-[#050505]/95 backdrop-blur-xl border-b border-[#222226] fixed top-0 left-0 right-0 z-40 px-6 py-3 flex items-center justify-between">
      {/* Brand Header */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center justify-center text-purple-400">
          <Hexagon className="w-8 h-8 stroke-[2.5] text-purple-500 fill-purple-950/40" />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-black text-2xl text-white tracking-widest font-mono">
            AI-GCC
          </span>
          <span className="tag-purple bg-purple-950/70 border border-purple-500/50 px-2.5 py-1 rounded text-xs">
            &lt; CONTROL CENTER &gt;
          </span>
        </div>
      </div>

      {/* Center Controls: Simulation Engine */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2.5 px-3.5 py-2 border text-sm font-mono font-bold transition-all ${
          isSimulating 
            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60 glow-green' 
            : 'bg-[#121215] text-neutral-300 border-[#222226]'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
          <span>SIMULATION: {isSimulating ? 'RUNNING' : 'STOPPED'}</span>
        </div>

        {isSimulating ? (
          <button
            onClick={stopSimulation}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold font-mono uppercase tracking-wider transition border border-rose-400/40 flex items-center gap-2"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop Simulation
          </button>
        ) : (
          <button
            onClick={startSimulation}
            className="px-5 py-2 btn-notch-purple text-sm flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Simulation
          </button>
        )}
      </div>

      {/* User Info & Notched Action Button */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-4 pl-4 border-l border-[#222226]">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white font-mono uppercase tracking-wide">{user.name}</div>
              <div className="text-xs text-purple-400 font-mono font-semibold">&lt; {user.role} &gt;</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2.5 bg-[#121215] hover:bg-[#1A1A1E] text-neutral-300 hover:text-white border border-[#222226] transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
