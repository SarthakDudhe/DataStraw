import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                S
              </span>
              <span className="text-lg font-semibold text-slate-900 tracking-tight">
                Support CRM
              </span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-2" aria-label="Main Navigation">
              <NavLink to="/" end className={navLinkClass}>
                Tickets
              </NavLink>
              <NavLink to="/tickets/new" className={navLinkClass}>
                Create Ticket
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/tickets/new"
              className="inline-flex items-center justify-center px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + New Ticket
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="sm:hidden border-t border-slate-100 px-4 py-2 flex space-x-2 bg-slate-50">
        <NavLink to="/" end className={navLinkClass}>
          Tickets
        </NavLink>
        <NavLink to="/tickets/new" className={navLinkClass}>
          Create Ticket
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;
