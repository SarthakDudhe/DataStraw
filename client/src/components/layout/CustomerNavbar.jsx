import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, LogOut, FileText, CheckSquare, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CustomerNavbar = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/portal" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-[#142a43] flex items-center justify-center text-white shadow-sm group-hover:bg-[#203a58] transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 tracking-tight block leading-tight">
                  Deskline Helpdesk
                </span>
                <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                  Customer Portal
                </span>
              </div>
            </Link>

            {/* In-page / route tab selectors */}
            <nav className="hidden sm:flex items-center space-x-1 ml-4" aria-label="Customer Portal Navigation">
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('submit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'submit'
                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Submit Request</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('tickets')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'tickets'
                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>My Tickets</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('faq')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'faq'
                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Knowledge Base</span>
              </button>
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-slate-800">
                {user?.name || 'Rahul Sharma'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {user?.email || 'customer@example.com'}
              </div>
            </div>

            <div className="w-7 h-7 rounded-full bg-cyan-800 text-white flex items-center justify-center text-[10px] font-bold">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'RS'}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md border border-slate-200 hover:border-red-200 transition-colors"
              title="Sign out of customer portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="sm:hidden border-t border-slate-100 px-4 py-2 flex items-center justify-around bg-slate-50 text-xs">
        <button
          type="button"
          onClick={() => onTabChange && onTabChange('submit')}
          className={`py-1 px-2.5 rounded font-medium ${
            activeTab === 'submit' ? 'bg-cyan-100 text-cyan-800' : 'text-slate-600'
          }`}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => onTabChange && onTabChange('tickets')}
          className={`py-1 px-2.5 rounded font-medium ${
            activeTab === 'tickets' ? 'bg-cyan-100 text-cyan-800' : 'text-slate-600'
          }`}
        >
          My Tickets
        </button>
        <button
          type="button"
          onClick={() => onTabChange && onTabChange('faq')}
          className={`py-1 px-2.5 rounded font-medium ${
            activeTab === 'faq' ? 'bg-cyan-100 text-cyan-800' : 'text-slate-600'
          }`}
        >
          FAQs
        </button>
      </div>
    </header>
  );
};

export default CustomerNavbar;
