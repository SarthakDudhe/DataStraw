import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layers, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  LifeBuoy
} from 'lucide-react';
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
  useEffect(() => {
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
    }, 300);
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
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex flex-col justify-between antialiased selection:bg-cyan-100 selection:text-slate-900 font-sans">
      {/* Top Brand Bar */}
      <header className="h-16 px-6 lg:px-12 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#142a43] flex items-center justify-center text-white shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 tracking-tight leading-none">
              Deskline
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Customer operations platform
            </div>
          </div>
        </div>

        {/* Live system status pill */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="hidden sm:inline-block">System Status:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Operational • 99.98% SLA
          </span>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Form Panel Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] p-6 sm:p-8">
            {/* Title & Introduction */}
            <div className="mb-6">
              <span className="ops-label text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 inline-block mb-2">
                Authentication Portal
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Choose your operational role to access your dedicated workspace.
              </p>
            </div>

            {/* Role Switcher Segmented Control */}
            <div className="flex rounded-lg bg-slate-100 p-1 mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'admin' ? 'text-cyan-700' : 'text-slate-400'}`} />
                <span>Support Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('customer')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                  activeTab === 'customer'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className={`w-3.5 h-3.5 ${activeTab === 'customer' ? 'text-cyan-700' : 'text-slate-400'}`} />
                <span>Customer Helpdesk</span>
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#142a43] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#142a43] transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#142a43] hover:bg-[#203a58] shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter {activeTab === 'admin' ? 'Support Workspace' : 'Customer Helpdesk'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access (Evaluator Section) */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="ops-label text-slate-500">
                  Instant Evaluator Demo
                </span>
                <span className="text-[10px] text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded font-mono border border-cyan-100 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-600" />
                  1-Click Access
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Demo Admin Card */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="p-2.5 text-left rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all group focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#142a43] text-white flex items-center justify-center text-[10px] font-bold">
                      AR
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-[#142a43] truncate">
                        Alex Rivera
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Support Admin
                      </div>
                    </div>
                  </div>
                </button>

                {/* Demo Customer Card */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('customer')}
                  className="p-2.5 text-left rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all group focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-cyan-800 text-white flex items-center justify-center text-[10px] font-bold">
                      RS
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-cyan-900 truncate">
                        Rahul Sharma
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Client / Customer
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Context note */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <LifeBuoy className="w-3.5 h-3.5 text-slate-400" />
            <span>Datastraw Support CRM • Architectural Role Separation</span>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-3 px-6 text-center text-[11px] text-slate-400 border-t border-slate-200/80 bg-white/40">
        Internal Deskline Operations Engine &bull; Enterprise Support Assessment
      </footer>
    </div>
  );
};

export default Login;
