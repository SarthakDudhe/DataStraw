import React from 'react';
import { formatDate } from '../../utils/formatDate';

const TicketMeta = ({ ticketId, createdAt, updatedAt, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 ${className}`}>
      {ticketId && (
        <span className="font-mono text-slate-600 font-medium">
          #{ticketId}
        </span>
      )}
      {createdAt && (
        <span>
          Created: <time dateTime={createdAt}>{formatDate(createdAt)}</time>
        </span>
      )}
      {updatedAt && (
        <span>
          Updated: <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
        </span>
      )}
    </div>
  );
};

export default TicketMeta;
