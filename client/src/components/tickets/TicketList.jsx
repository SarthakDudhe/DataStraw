import React from 'react';
import TicketTable from './TicketTable';
import TicketCard from './TicketCard';
import EmptyState from '../common/EmptyState';
import { TableSkeleton, CardSkeleton } from '../common/LoadingState';

const TicketList = ({
  tickets = [],
  loading = false,
  isFiltered = false,
  onClearFilters,
}) => {
  if (loading) {
    return (
      <div>
        <div className="hidden md:block">
          <TableSkeleton rows={5} />
        </div>
        <div className="md:hidden">
          <CardSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <EmptyState
        title={isFiltered ? 'No tickets found' : 'No support tickets yet'}
        description={
          isFiltered
            ? 'There are no support tickets matching your current search or status filters.'
            : 'Create your first support ticket to get started.'
        }
        isFiltered={isFiltered}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <TicketTable tickets={tickets} />
      </div>

      {/* Mobile Card View */}
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
