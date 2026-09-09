import React from 'react';
import { Calendar, Clock, Hash } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const TicketMeta = ({ ticketId, createdAt, updatedAt, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 ${className}`}>
      {ticketId && (
        <span className="inline-flex items-center gap-1 font-mono text-zinc-400 font-medium bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          <Hash className="w-3 h-3 text-zinc-500" />
          {ticketId}
        </span>
      )}
      {createdAt && (
        <span className="inline-flex items-center gap-1.5 text-zinc-400">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>Created: {formatDate(createdAt)}</span>
        </span>
      )}
      {updatedAt && (
        <span className="inline-flex items-center gap-1.5 text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>Updated: {formatDate(updatedAt)}</span>
        </span>
      )}
    </div>
  );
};

export default TicketMeta;
