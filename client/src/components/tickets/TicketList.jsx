import React from 'react';
import TicketTable from './TicketTable';
import TicketCard from './TicketCard';
import EmptyState from '../common/EmptyState';

const TicketList = ({ tickets = [] }) => {
  if (!tickets || tickets.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <TicketTable tickets={tickets} />
      </div>

      {/* Mobile / Tablet View */}
      <div className="md:hidden space-y-3">
        {tickets.map((ticket) => {
          const key = ticket.ticket_id || ticket.id;
          return <TicketCard key={key} ticket={ticket} />;
        })}
      </div>
    </div>
  );
};

export default TicketList;
