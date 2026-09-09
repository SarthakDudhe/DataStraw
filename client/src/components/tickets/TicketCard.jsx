import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/formatDate';

const TicketCard = ({ ticket }) => {
  const ticketId = ticket.ticket_id || ticket.id;
  const customerName = ticket.customer_name || ticket.customerName;
  const customerEmail = ticket.customer_email || ticket.customerEmail;
  const createdAt = ticket.created_at || ticket.createdAt;

  return (
    <Link
      to={`/tickets/${ticketId}`}
      className="block bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 hover:shadow transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-bold text-blue-600 group-hover:underline">
          {ticketId}
        </span>
        <StatusBadge status={ticket.status} />
      </div>

      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
        {ticket.subject}
      </h3>

      <div className="mt-2 text-xs text-slate-600">
        <span className="font-medium text-slate-800">{customerName}</span>
        {customerEmail && (
          <span className="text-slate-400 ml-1.5">&bull; {customerEmail}</span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Created {formatDate(createdAt, false)}</span>
        <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">
          &rarr;
        </span>
      </div>
    </Link>
  );
};

export default TicketCard;
