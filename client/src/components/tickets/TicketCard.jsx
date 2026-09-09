import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/formatDate';

const TicketCard = ({ ticket }) => {
  const ticketId = ticket.ticket_id || ticket.id;
  const customerName = ticket.customer_name || ticket.customerName || '—';
  const customerEmail = ticket.customer_email || ticket.customerEmail || '';
  const createdAt = ticket.created_at || ticket.createdAt;

  return (
    <Link
      to={`/tickets/${ticketId}`}
      className="block bg-[#111113] border border-zinc-800/80 rounded-xl p-4 shadow-subtle hover:border-zinc-700 hover:bg-zinc-900/40 transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-semibold text-zinc-400 group-hover:text-blue-400">
          #{ticketId}
        </span>
        <StatusBadge status={ticket.status} />
      </div>

      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2">
        {ticket.subject}
      </h3>

      <div className="mt-2.5 flex items-center gap-2 text-xs text-zinc-400">
        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-[10px] font-medium text-zinc-300">
          {customerName.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-zinc-300">{customerName}</span>
        {customerEmail && (
          <span className="text-zinc-500 truncate">&bull; {customerEmail}</span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-zinc-500" />
          <span>{formatDate(createdAt, false)}</span>
        </span>
        <span className="text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          <span>View</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};

export default TicketCard;
