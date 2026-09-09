import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/search/SearchBar';
import StatusFilter from '../components/search/StatusFilter';
import TicketList from '../components/tickets/TicketList';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  // At this foundation stage, tickets is empty array. No fake tickets.
  const [tickets] = useState([]);

  const newTicketAction = (
    <Link
      to="/tickets/new"
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      + New Ticket
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Manage, monitor, and resolve incoming customer support tickets."
        action={newTicketAction}
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by customer, ID, or subject..."
          />
        </div>
        <div className="flex items-center justify-start sm:justify-end">
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Ticket List Area */}
      <TicketList tickets={tickets} />
    </div>
  );
};

export default Home;
