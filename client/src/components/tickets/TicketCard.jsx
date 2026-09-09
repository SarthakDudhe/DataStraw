import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import TicketMeta from './TicketMeta';

const TicketCard = ({ ticket }) => {
  const { id, ticket_id, customerName, customer_name, subject, status, createdAt, created_at } = ticket;
  const displayId = ticket_id || id;
  const displayName = customer_name || customerName;
  const displayCreated = created_at || createdAt;

  return (
    <article className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono text-xs font-semibold text-slate-500">
          #{displayId}
        </span>
        <StatusBadge status={status} />
      </div>

      <Link
        to={`/tickets/${displayId}`}
        className="block group"
      >
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {subject}
        </h3>
      </Link>

      <p className="mt-1 text-xs text-slate-600 font-medium">
        {displayName}
      </p>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <TicketMeta createdAt={displayCreated} />
        <Link
          to={`/tickets/${displayId}`}
          className="text-blue-600 font-medium hover:underline text-xs"
        >
          View details &rarr;
        </Link>
      </div>
    </article>
  );
};

export default TicketCard;
