import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Layers, 
  Clock, 
  CheckCircle2, 
  CircleDot,
  RotateCcw
} from 'lucide-react';
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

  // Calculate real metrics from the fetched tickets
  const stats = useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let closed = 0;

    tickets.forEach((t) => {
      const s = (t.status || '').toLowerCase();
      if (s === 'open') open++;
      else if (s === 'in progress') inProgress++;
      else if (s === 'closed') closed++;
    });

    return {
      total: totalCount,
      open,
      inProgress,
      closed,
    };
  }, [tickets, totalCount]);

  const newTicketAction = (
    <Link
      to="/tickets/new"
      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-sm border border-blue-500/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
    >
      <Plus className="w-4 h-4" />
      <span>Create Ticket</span>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Support Tickets"
        description="Manage customer support requests and track their progress."
        action={newTicketAction}
      />

      {/* Top Compact Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total */}
        <button
          type="button"
          onClick={() => setStatusFilter('All Statuses')}
          className={`p-3.5 rounded-xl border transition-all text-left group select-none ${
            statusFilter === 'All Statuses' || statusFilter === 'All'
              ? 'bg-zinc-900/90 border-blue-500/40 shadow-subtle'
              : 'bg-[#111113] border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total Tickets</span>
            <Layers className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
          </div>
          <div className="mt-2 text-xl font-bold text-zinc-100 tracking-tight">
            {loading ? '—' : stats.total}
          </div>
        </button>

        {/* Open */}
        <button
          type="button"
          onClick={() => setStatusFilter('Open')}
          className={`p-3.5 rounded-xl border transition-all text-left group select-none ${
            statusFilter === 'Open'
              ? 'bg-blue-500/10 border-blue-500/40 shadow-subtle'
              : 'bg-[#111113] border-zinc-800/80 hover:border-blue-500/30 hover:bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center justify-between text-blue-400/80 text-xs font-medium">
            <span>Open</span>
            <CircleDot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-blue-400 tracking-tight">
            {loading ? '—' : stats.open}
          </div>
        </button>

        {/* In Progress */}
        <button
          type="button"
          onClick={() => setStatusFilter('In Progress')}
          className={`p-3.5 rounded-xl border transition-all text-left group select-none ${
            statusFilter === 'In Progress'
              ? 'bg-amber-500/10 border-amber-500/40 shadow-subtle'
              : 'bg-[#111113] border-zinc-800/80 hover:border-amber-500/30 hover:bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400/80 text-xs font-medium">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-400 tracking-tight">
            {loading ? '—' : stats.inProgress}
          </div>
        </button>

        {/* Closed */}
        <button
          type="button"
          onClick={() => setStatusFilter('Closed')}
          className={`p-3.5 rounded-xl border transition-all text-left group select-none ${
            statusFilter === 'Closed'
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-subtle'
              : 'bg-[#111113] border-zinc-800/80 hover:border-emerald-500/30 hover:bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400/80 text-xs font-medium">
            <span>Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400 tracking-tight">
            {loading ? '—' : stats.closed}
          </div>
        </button>
      </div>

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-3.5 shadow-subtle space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Search tickets by ID, customer, email, or description..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {/* Sorting Dropdown */}
          <div className="relative">
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-3 py-2 pr-7 bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors shadow-subtle cursor-pointer"
            >
              <option value="newest" className="bg-[#111113] text-zinc-100">Sort: Newest</option>
              <option value="urgent_sla" className="bg-[#111113] text-amber-400 font-medium">Sort: Most Urgent SLA ⚡</option>
              <option value="oldest" className="bg-[#111113] text-zinc-100">Sort: Oldest</option>
              <option value="recently_updated" className="bg-[#111113] text-zinc-100">Sort: Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active filter count & reset */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span>
            Showing <strong className="text-zinc-200 font-semibold">{totalCount}</strong>{' '}
            {totalCount === 1 ? 'ticket' : 'tickets'}
            {isFiltered && ' (filtered)'}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      )}

      {/* Ticket List View */}
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
