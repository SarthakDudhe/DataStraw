import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Keyboard, X, Command } from 'lucide-react';

const SHORTCUTS = [
  { key: '/', description: 'Focus search input from anywhere' },
  { key: 'c', description: 'Create new ticket' },
  { key: 'g then h', description: 'Go to Tickets Dashboard' },
  { key: 'g then a', description: 'Go to Analytics & SLA' },
  { key: '?', description: 'Toggle this keyboard shortcuts cheatsheet' },
  { key: 'Esc', description: 'Close modal or blur active input' },
];

export const KeyboardShortcutsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastKey, setLastKey] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let gPressedTimeout = null;

    const handleKeyDown = (e) => {
      // Don't intercept when user is typing in an input, textarea, or select
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (e.key === 'Escape') {
        if (isOpen) {
          setIsOpen(false);
        } else if (isInput) {
          document.activeElement?.blur();
        }
        return;
      }

      if (isInput) return;

      // Toggle shortcuts modal with ?
      if (e.key === '?' && (e.shiftKey || e.key === '?')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Focus search with /
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input') || document.querySelector('input[type="text"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select?.();
        }
        return;
      }

      // Create new ticket with 'c'
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        navigate('/tickets/new');
        return;
      }

      // Two-key chord: 'g' then 'h' or 'a'
      if (e.key === 'g' || e.key === 'G') {
        setLastKey('g');
        clearTimeout(gPressedTimeout);
        gPressedTimeout = setTimeout(() => {
          setLastKey('');
        }, 1200);
        return;
      }

      if (lastKey === 'g') {
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          navigate('/');
          setLastKey('');
        } else if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          navigate('/analytics');
          setLastKey('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gPressedTimeout);
    };
  }, [isOpen, lastKey, navigate, location.pathname]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-500">Power user workflow actions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {SHORTCUTS.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <span className="text-slate-700 font-medium">{item.description}</span>
              <kbd className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-600 shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded font-mono text-[10px]">Esc</kbd> to close</span>
          <span>Deskline</span>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
