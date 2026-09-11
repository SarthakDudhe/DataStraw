import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin, isAuthenticated, role } = useAuth();

  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'customer'
  const [email, setEmail] = useState(DEMO_CREDENTIALS.ADMIN.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.ADMIN.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to appropriate portal
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'customer') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'admin') {
      setEmail(DEMO_CREDENTIALS.ADMIN.email);
      setPassword(DEMO_CREDENTIALS.ADMIN.password);
    } else {
      setEmail(DEMO_CREDENTIALS.CUSTOMER.email);
      setPassword(DEMO_CREDENTIALS.CUSTOMER.password);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);
      if (result.success) {
        const from = location.state?.from?.pathname;
        if (from && from !== '/login') {
          navigate(from, { replace: true });
        } else if (result.user.role === 'customer') {
          navigate('/portal', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError(result.error);
      }
    }, 350);
  };

  const handleQuickDemo = (demoRole) => {
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      const user = demoLogin(demoRole);
      setIsLoading(false);
      if (user.role === 'customer') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 border border-blue-400/30">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Datastraw Support CRM
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Enterprise ticketing, customer helpdesk & triage platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Role Mode Tabs */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Support Admin / Staff</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('customer')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
                activeTab === 'customer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Customer Portal</span>
            </button>
          </div>

          {/* Role Context Hint */}
          <div className="mb-6 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 flex items-start gap-3">
            <span className="p-1 rounded-md bg-blue-500/20 text-blue-400 mt-0.5 shrink-0 font-mono">
              {activeTab === 'admin' ? 'AGENT' : 'CLIENT'}
            </span>
            <div>
              {activeTab === 'admin' ? (
                <p>
                  Access the internal monitoring console: live queue, triage, status updates, SLA countdowns, and internal support notes.
                </p>
              ) : (
                <p>
                  Access the customer help center: submit new support inquiries, track personal ticket status, and browse self-help articles.
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
              } disabled:opacity-60 disabled:cursor-not-allowed mt-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to {activeTab === 'admin' ? 'Support CRM' : 'Customer Portal'} &rarr;</span>
              )}
            </button>
          </form>

          {/* Quick Demo Section (Highlighted for Evaluators) */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                1-Click Evaluator Demo Access
              </span>
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Auto-Login
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-3 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-white group-hover:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Demo Admin</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  admin@datastraw.io
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="p-3 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-white group-hover:text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Demo Customer</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  customer@example.com
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Datastraw Technologies Assessment • Role-Separated Support System
        </p>
      </div>
    </div>
  );
};

export default Login;
