import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import { Play, Square, LogOut, Hexagon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isSimulating, startSimulation, stopSimulation } = useSimulation();

  return (
    <header className="h-16 bg-[#050505]/95 backdrop-blur-xl border-b border-[#222226] fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Header - AIVAR Style */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center text-purple-400">
          <Hexagon className="w-7 h-7 stroke-[2.5] text-purple-500 fill-purple-950/40" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-black text-xl text-white tracking-widest font-mono">
            AI\ \VAR
          </span>
          <span className="tag-purple bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded text-[10px]">
            &lt; CONTROL CENTER &gt;
          </span>
        </div>
      </div>

      {/* Center Controls: Simulation Engine */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-none border text-xs font-mono font-bold transition-all ${
          isSimulating 
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 glow-green' 
            : 'bg-[#121215] text-neutral-400 border-[#222226]'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
          <span>SIMULATION: {isSimulating ? 'RUNNING' : 'STOPPED'}</span>
        </div>

        {isSimulating ? (
          <button
            onClick={stopSimulation}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono uppercase tracking-wider transition border border-rose-400/30 flex items-center gap-2"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop Simulation
          </button>
        ) : (
          <button
            onClick={startSimulation}
            className="px-4 py-2 btn-notch-purple text-xs flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Simulation
          </button>
        )}
      </div>

      {/* User Info & Notched Action Button */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-4 pl-4 border-l border-[#222226]">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wide">{user.name}</div>
              <div className="text-[10px] text-purple-400 font-mono">&lt; {user.role} &gt;</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 bg-[#121215] hover:bg-[#1A1A1E] text-neutral-400 hover:text-white border border-[#222226] transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
