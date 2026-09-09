import React from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/search/SearchBar';
import StatusFilter from '../components/search/StatusFilter';
import TicketList from '../components/tickets/TicketList';
import ErrorState from '../components/common/ErrorState';

const Home = () => {
  const {
    tickets,
    totalCount,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    clearFilters,
    refetch,
  } = useTickets();

  const isFiltered = Boolean(
    searchTerm.trim() || (statusFilter && statusFilter !== 'All Statuses' && statusFilter !== 'All')
  );

  const newTicketAction = (
    <Link
      to="/tickets/new"
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      + Create Ticket
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Manage customer support requests and track their progress."
        action={newTicketAction}
      />

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex-1 max-w-lg">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Search tickets by ID, customer, email, or description..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {/* Bonus sorting feature: Newest, Oldest, Recently Updated */}
          <div className="relative">
            <label htmlFor="sort-select" className="sr-only">
              Sort tickets
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="recently_updated">Sort: Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket Count & Filter State Indicator */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{totalCount}</strong>{' '}
            {totalCount === 1 ? 'ticket' : 'tickets'}
            {isFiltered && ' (filtered)'}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {error ? (
        <ErrorState
          title="Unable to load tickets"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <TicketList
          tickets={tickets}
          loading={loading}
          isFiltered={isFiltered}
          onClearFilters={clearFilters}
        />
      )}
    </div>
  );
};

export default Home;
