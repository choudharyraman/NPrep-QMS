// src/pages/LoginView.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, BookOpen, Loader2, GraduationCap, Stethoscope, Settings } from 'lucide-react';

const DEMO_CREDENTIALS = [
  { label: 'Student', icon: GraduationCap, email: 'student@nprep.in', password: 'student123', color: 'bg-blue-50 border-blue-200 text-[#1ba1f5] hover:bg-blue-100', desc: 'View & submit doubts' },
  { label: 'Faculty', icon: Stethoscope, email: 'faculty@nprep.in', password: 'faculty123', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100', desc: 'Resolve student doubts' },
  { label: 'Ops', icon: Settings, email: 'ops@nprep.in', password: 'ops123', color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100', desc: 'Operations dashboard' },
];

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
    setIsLoading(false);
  };

  const fillCredentials = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b163f] via-[#0e2060] to-[#1a3a80] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1ba1f5]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1ba1f5]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-2xl shadow-[#1ba1f5]/20 mb-4">
            <BookOpen className="w-8 h-8 text-[#1ba1f5]" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight font-outfit">NPrep</h1>
          <p className="text-blue-300 mt-1.5 text-sm font-medium">Doubt Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 p-8">
          <h2 className="text-2xl font-bold text-[#0b163f] mb-1 font-outfit">Welcome back 👋</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to continue your learning journey</p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@nprep.in"
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#1ba1f5] focus:ring-2 focus:ring-[#1ba1f5]/20 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#1ba1f5] focus:ring-2 focus:ring-[#1ba1f5]/20 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#1ba1f5] hover:bg-[#0d8fd8] active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-[#1ba1f5]/30 mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

          {/* Static Demo Guide */}
          <div className="mt-6 bg-blue-50/80 border border-[#1ba1f5]/20 rounded-xl p-3.5 flex items-start gap-3">
            <div className="bg-white shadow-sm border border-blue-100 p-2 rounded-xl shrink-0">
              <BookOpen size={16} className="text-[#1ba1f5]" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
              <strong className="text-[#0b163f]">Demo Guide:</strong> Click <strong>Student</strong>, <strong>Faculty</strong>, or <strong>Ops</strong> below to auto-fill credentials, then click <strong>Sign In</strong> to explore.
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
              Quick Demo Access
            </p>
            <div className="flex gap-2">
              {DEMO_CREDENTIALS.map(cred => (
                <button
                  key={cred.label}
                  onClick={() => fillCredentials(cred)}
                  className={`flex-1 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97] flex flex-col items-center gap-1 ${cred.color}`}
                >
                  <cred.icon size={16} />
                  {cred.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3">
              Click a role above to auto-fill credentials, then Sign In
            </p>
          </div>
        </div>

        <p className="text-center text-blue-300/60 text-xs mt-6">
          © 2026 NPrep · Offline-First · PWA
        </p>
      </div>
    </div>
  );
};
