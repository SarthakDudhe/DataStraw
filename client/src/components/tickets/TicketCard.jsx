import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import SlaBadge from './SlaBadge';
import TagBadge from './TagBadge';
import { formatDate } from '../../utils/formatDate';
import { getTicketTags } from '../../utils/tagUtils';

const TicketCard = ({ ticket }) => {
  const ticketId = ticket.ticket_id || ticket.id;
  const customerName = ticket.customer_name || ticket.customerName || '—';
  const customerEmail = ticket.customer_email || ticket.customerEmail || '';
  const createdAt = ticket.created_at || ticket.createdAt;
  const tags = getTicketTags(ticket);

  return (
    <Link
      to={`/tickets/${ticketId}`}
      className="block bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-cyan-200 hover:bg-cyan-50/30 transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-xs font-semibold text-cyan-700">
            #{ticketId}
          </span>
          <SlaBadge createdAt={createdAt} status={ticket.status} compact />
          {ticket.impact_level && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              ticket.impact_level === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              ticket.impact_level === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              ticket.impact_level === 'Moderate' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
              'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {ticket.impact_level} {typeof ticket.impact_score === 'number' ? `${ticket.impact_score}` : ''}
            </span>
          )}
          {ticket.incident_id && (
            <span className="font-mono text-[10px] font-semibold text-cyan-800 bg-cyan-100/70 border border-cyan-200 px-1.5 py-0.5 rounded">
              {ticket.incident_id}
            </span>
          )}
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <h3 className="text-sm font-semibold text-slate-800 group-hover:text-cyan-800 transition-colors line-clamp-2">
        {ticket.subject}
      </h3>

      <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
        <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[10px] font-medium text-amber-800">
          {customerName.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-slate-700">{customerName}</span>
        {customerEmail && (
          <span className="text-slate-400 truncate">&bull; {customerEmail}</span>
        )}
      </div>

      {/* Category Tags */}
      {tags.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatDate(createdAt, false)}</span>
        </span>
        <span className="text-cyan-700 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          <span>View</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};

export default TicketCard;
