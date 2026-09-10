import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Inbox, 
  PlusCircle, 
  BarChart3,
  Siren,
  BookOpen,
  Layers,
  Sparkles,
  LifeBuoy
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-cyan-50 text-cyan-800 border border-cyan-100'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const content = (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-slate-200 select-none">
      {/* Workspace / Brand branding */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
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
              Customer operations
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              onClick={onCloseMobile}
              className={navItemClass}
            >
              <Inbox className="w-4 h-4" />
              <span>Inbox</span>
            </NavLink>
            <NavLink
              to="/tickets/new"
              onClick={onCloseMobile}
              className={navItemClass}
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Ticket</span>
            </NavLink>
            <NavLink
              to="/analytics"
              onClick={onCloseMobile}
              className={navItemClass}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Performance</span>
            </NavLink>
            <NavLink
              to="/incidents"
              onClick={onCloseMobile}
              className={navItemClass}
            >
              <Siren className="w-4 h-4" />
              <span>Incidents</span>
            </NavLink>
            <NavLink
              to="/knowledge"
              onClick={onCloseMobile}
              className={navItemClass}
            >
              <BookOpen className="w-4 h-4" />
              <span>Knowledge</span>
            </NavLink>
          </nav>
        </div>

        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            System
          </div>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>AI workspace</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User / Agent status footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white transition-colors cursor-default">
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-medium text-xs text-amber-800">
            SC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-800 truncate">Support Agent</p>
            <p className="text-[11px] text-slate-500 truncate">Online and available</p>
          </div>
          <LifeBuoy className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
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
