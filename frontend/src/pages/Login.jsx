import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('governance@demo.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed. Check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail('governance@demo.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-[#030304] bg-purple-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel bg-[#0C0C0E]/95 rounded-2xl border border-[#222226] p-8 shadow-2xl relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-600 to-purple-400 p-0.5 shadow-xl shadow-purple-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#050505] rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-purple-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">AI Governance Control Center</h2>
          <p className="text-xs text-[#9999A1] mt-1.5 font-medium">Enterprise Compliance & Automated Governance Portal</p>
        </div>

        {/* Demo Credentials Quick Box */}
        <div className="mb-6 bg-[#121215] border border-purple-500/30 p-3.5 rounded-xl flex items-center justify-between text-xs text-neutral-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Demo Account Ready</div>
              <div className="text-[11px] text-[#9999A1] font-mono">governance@demo.com / demo123</div>
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="px-3 py-1.5 btn-notch-purple text-[11px] rounded transition"
          >
            Auto-fill
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9999A1] uppercase tracking-wider mb-1.5 font-mono">
              Governance Team Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="governance@demo.com"
                className="w-full bg-[#050505] border border-[#222226] focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9999A1] uppercase tracking-wider mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050505] border border-[#222226] focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 btn-notch-purple rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition text-sm disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Login to Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Clean Single-Line Footer */}
        <div className="mt-6 pt-4 border-t border-[#222226] flex items-center justify-between text-[11px] text-[#9999A1] font-mono">
          <span>Authorized Personnel Only</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            JWT Secured
          </span>
        </div>
      </div>
    </div>
  );
}
