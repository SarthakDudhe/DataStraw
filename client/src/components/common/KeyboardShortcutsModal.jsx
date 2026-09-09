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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Keyboard Shortcuts</h3>
              <p className="text-xs text-zinc-400">Power user workflow actions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-zinc-800/80 text-xs">
          {SHORTCUTS.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <span className="text-zinc-300 font-medium">{item.description}</span>
              <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700/80 rounded font-mono text-[11px] text-zinc-300 shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-[10px]">Esc</kbd> to close</span>
          <span>Support CRM v2.0</span>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
