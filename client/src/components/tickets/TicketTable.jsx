import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/formatDate';

const TicketTable = ({ tickets = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">Ticket ID</th>
              <th scope="col" className="px-6 py-3.5">Customer</th>
              <th scope="col" className="px-6 py-3.5">Subject</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5">Created</th>
              <th scope="col" className="px-6 py-3.5 text-right sr-only">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tickets.map((ticket) => {
              const ticketId = ticket.ticket_id || ticket.id;
              const customerName = ticket.customer_name || ticket.customerName;
              const customerEmail = ticket.customer_email || ticket.customerEmail;
              const createdAt = ticket.created_at || ticket.createdAt;

              return (
                <tr
                  key={ticketId}
                  onClick={() => navigate(`/tickets/${ticketId}`)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-blue-600 group-hover:underline">
                    {ticketId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{customerName}</div>
                    {customerEmail && (
                      <div className="text-xs text-slate-500">{customerEmail}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {formatDate(createdAt, false)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium text-slate-400 group-hover:text-blue-600">
                    &rarr;
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
