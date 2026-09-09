import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/formatDate';

const TicketTable = ({ tickets = [] }) => {
  return (
    <div className="overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium text-xs uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3">Ticket ID</th>
              <th scope="col" className="px-6 py-3">Customer Name</th>
              <th scope="col" className="px-6 py-3">Subject</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Created Date</th>
              <th scope="col" className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tickets.map((ticket) => {
              const displayId = ticket.ticket_id || ticket.id;
              const displayName = ticket.customer_name || ticket.customerName;
              const displayCreated = ticket.created_at || ticket.createdAt;

              return (
                <tr key={displayId} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-slate-600">
                    #{displayId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                    {displayName}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/tickets/${displayId}`}
                      className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {ticket.subject}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {formatDate(displayCreated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <Link
                      to={`/tickets/${displayId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
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
