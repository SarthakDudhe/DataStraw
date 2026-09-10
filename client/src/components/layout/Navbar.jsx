import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Plus, 
  Bell, 
  Search, 
  HelpCircle,
  Layers
} from 'lucide-react';

const Navbar = ({ onToggleMobile }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile hamburger & branding */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-none"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-6 h-6 rounded bg-[#142a43] flex items-center justify-center text-white text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm text-slate-900 tracking-tight">
            Deskline
          </span>
        </div>

        {/* Desktop Quick Search Trigger Bar */}
        <div 
          onClick={() => {
            const el = document.getElementById('search-input') || document.querySelector('input[type="text"]');
            if (el) {
              el.focus();
              el.select?.();
            }
          }}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-500 text-xs w-64 md:w-80 cursor-pointer transition-colors"
          title="Press / to search"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 flex-1">Search tickets...</span>
          <kbd className="inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            /
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Keyboard Shortcuts Trigger */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))}
          className="ops-icon-button"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Subtle notifications bell */}
        <button
          type="button"
          className="relative ops-icon-button"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        </button>

        {/* Primary Action Button */}
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#142a43] hover:bg-[#203a58] rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Ticket</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
