import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/formatDate';

const TicketTable = ({ tickets = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-[0.08em]">
            <tr>
              <th scope="col" className="px-6 py-3.5">Ticket</th>
              <th scope="col" className="px-6 py-3.5">Customer</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5">Created</th>
              <th scope="col" className="px-6 py-3.5 text-right sr-only">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tickets.map((ticket) => {
              const ticketId = ticket.ticket_id || ticket.id;
              const customerName = ticket.customer_name || ticket.customerName || '—';
              const customerEmail = ticket.customer_email || ticket.customerEmail || '';
              const createdAt = ticket.created_at || ticket.createdAt;

              return (
                <tr
                  key={ticketId}
                  onClick={() => navigate(`/tickets/${ticketId}`)}
                  className="cursor-pointer hover:bg-cyan-50/40 transition-colors group"
                >
                  {/* Ticket ID & Subject */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-cyan-700 transition-colors">
                        #{ticketId}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 group-hover:text-cyan-800 transition-colors line-clamp-1 max-w-sm sm:max-w-md">
                      {ticket.subject}
                    </div>
                  </td>

                  {/* Customer Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[11px] font-semibold text-amber-800">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-700 text-xs sm:text-sm">
                          {customerName}
                        </div>
                        {customerEmail && (
                          <div className="text-xs text-slate-500">
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
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                    {formatDate(createdAt, false)}
                  </td>

                  {/* Subtle Action Arrow */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all">
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
