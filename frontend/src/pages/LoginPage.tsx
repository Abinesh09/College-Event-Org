import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, KeyRound, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-8 text-white text-center">
          <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-900 font-bold shadow-md shadow-teal-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Portal Authentication</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in with your academic credentials</p>
        </div>

        {/* Quick Demo Logins Helper */}
        <div className="bg-teal-50/60 p-4 border-b border-teal-100/80">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-800 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-teal-600" />
            <span>Quick Demo Auto-Fill:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('teacher@college.edu')}
              className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-teal-200 text-xs text-slate-700 hover:border-teal-400 transition-colors"
            >
              <div className="font-bold text-purple-700">Prof. K. Anbarasan</div>
              <div className="text-[10px] text-slate-500 truncate">teacher@college.edu • Anna Univ</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('alex.student@college.edu')}
              className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-teal-200 text-xs text-slate-700 hover:border-teal-400 transition-colors"
            >
              <div className="font-bold text-teal-700">Karthik Raja</div>
              <div className="text-[10px] text-slate-500 truncate">alex.student@college.edu • CEG</div>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <span className="text-[11px] text-slate-400">Demo pwd: Password123!</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
            <p>
              New Student?{' '}
              <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
                Register for an account
              </Link>
            </p>
            <p className="text-[11px] text-slate-400">
              Teacher accounts are provisioned via administrative seeding.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

