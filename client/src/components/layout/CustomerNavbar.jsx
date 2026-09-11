import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                  Datastraw Help Desk
                </span>
                <span className="text-[11px] font-medium text-indigo-600 block leading-tight">
                  Customer Self-Service Portal
                </span>
              </div>
            </Link>

            {/* In-page / route tab selectors */}
            <nav className="hidden sm:flex items-center space-x-1 ml-4" aria-label="Customer Portal Navigation">
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('submit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'submit'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('tickets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'tickets'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                My Tickets
              </button>
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('faq')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'faq'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Knowledge Base
              </button>
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-slate-800">
                {user?.name || 'Valued Customer'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {user?.email || 'customer@example.com'}
              </div>
            </div>

            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Customer
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
              title="Sign out of customer portal"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
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
            activeTab === 'submit' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600'
          }`}
        >
          Submit Request
        </button>
        <button
          type="button"
          onClick={() => onTabChange && onTabChange('tickets')}
          className={`py-1 px-2.5 rounded font-medium ${
            activeTab === 'tickets' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600'
          }`}
        >
          My Tickets
        </button>
        <button
          type="button"
          onClick={() => onTabChange && onTabChange('faq')}
          className={`py-1 px-2.5 rounded font-medium ${
            activeTab === 'faq' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600'
          }`}
        >
          FAQs
        </button>
      </div>
    </header>
  );
};

export default CustomerNavbar;
