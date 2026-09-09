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
    <header className="h-14 border-b border-zinc-800/80 bg-[#111113]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile hamburger & branding */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 md:hidden focus:outline-none"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm text-zinc-100 tracking-tight">
            Support CRM
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
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 text-xs w-64 md:w-80 cursor-pointer transition-colors"
          title="Press / to search"
        >
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-500 flex-1">Quick search...</span>
          <kbd className="inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700/60">
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
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors focus:outline-none"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Subtle notifications bell */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors focus:outline-none"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        </button>

        {/* Primary Action Button */}
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-sm transition-all duration-150 border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Ticket</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
