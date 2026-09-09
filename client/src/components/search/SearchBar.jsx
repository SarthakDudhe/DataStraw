import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search tickets by ID, customer, email, or description...',
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search tickets"
        className="w-full pl-9 pr-9 py-2 bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700/90 rounded-lg text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/80 transition-colors shadow-subtle"
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 focus:outline-none"
          aria-label="Clear search input"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
