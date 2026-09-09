import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Inbox, 
  PlusCircle, 
  BarChart3,
  Layers,
  Sparkles,
  LifeBuoy
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-zinc-800/80 text-white shadow-subtle border border-zinc-700/50'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
    }`;

  const content = (
    <aside className="w-64 h-full flex flex-col bg-[#111113] border-r border-zinc-800/80 select-none">
      {/* Workspace / Brand branding */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100 tracking-tight leading-none">
              Support CRM
            </div>
            <div className="text-[11px] text-zinc-500 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Live Operations
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Workspace
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              onClick={onCloseMobile}
              className={navItemClass}
            >
              <Inbox className="w-4 h-4 text-zinc-400" />
              <span>Tickets Dashboard</span>
            </NavLink>
            <NavLink
              to="/tickets/new"
              onClick={onCloseMobile}
              className={navItemClass}
            >
              <PlusCircle className="w-4 h-4 text-zinc-400" />
              <span>New Ticket</span>
            </NavLink>
            <NavLink
              to="/analytics"
              onClick={onCloseMobile}
              className={navItemClass}
            >
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <span>Analytics & SLA</span>
            </NavLink>
          </nav>
        </div>

        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            System
          </div>
          <div className="space-y-1 text-xs text-zinc-400">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>REST API</span>
              </span>
              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User / Agent status footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-900/60 transition-colors cursor-default">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-medium text-xs text-zinc-200">
            SC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-200 truncate">Support Agent</p>
            <p className="text-[11px] text-zinc-500 truncate">agent@support.crm</p>
          </div>
          <LifeBuoy className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0">
        {content}
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Off-canvas Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  );
};

export default Sidebar;
