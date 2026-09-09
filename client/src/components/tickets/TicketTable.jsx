import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Mail } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/formatDate';

const TicketTable = ({ tickets = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden bg-[#111113] border border-zinc-800/80 rounded-xl shadow-subtle">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800/80 text-left text-sm">
          <thead className="bg-zinc-950/60 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">Ticket</th>
              <th scope="col" className="px-6 py-3.5">Customer</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5">Created</th>
              <th scope="col" className="px-6 py-3.5 text-right sr-only">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 bg-[#111113]">
            {tickets.map((ticket) => {
              const ticketId = ticket.ticket_id || ticket.id;
              const customerName = ticket.customer_name || ticket.customerName || '—';
              const customerEmail = ticket.customer_email || ticket.customerEmail || '';
              const createdAt = ticket.created_at || ticket.createdAt;

              return (
                <tr
                  key={ticketId}
                  onClick={() => navigate(`/tickets/${ticketId}`)}
                  className="cursor-pointer hover:bg-zinc-900/60 transition-colors group"
                >
                  {/* Ticket ID & Subject */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-medium text-zinc-400 group-hover:text-blue-400 transition-colors">
                        #{ticketId}
                      </span>
                    </div>
                    <div className="font-medium text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-1 max-w-sm sm:max-w-md">
                      {ticket.subject}
                    </div>
                  </td>

                  {/* Customer Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-[11px] font-medium text-zinc-300">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200 text-xs sm:text-sm">
                          {customerName}
                        </div>
                        {customerEmail && (
                          <div className="text-xs text-zinc-500">
                            {customerEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={ticket.status} />
                  </td>

                  {/* Created Timestamp */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400 font-mono">
                    {formatDate(createdAt, false)}
                  </td>

                  {/* Subtle Action Arrow */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;
