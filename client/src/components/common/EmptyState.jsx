import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Plus } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  title = 'No tickets found',
  description = 'There are no support tickets matching your current criteria.',
  isFiltered = false,
  onClearFilters,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-14 border border-dashed border-slate-300 rounded-lg bg-white ${className}`}
    >
      <div className="w-12 h-12 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 mb-3 shadow-sm">
        <Inbox className="w-5 h-5 text-cyan-700" />
      </div>

      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        {isFiltered && onClearFilters && (
          <Button variant="secondary" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
        <Link to="/tickets/new">
          <Button variant="primary">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Ticket</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EmptyState;
