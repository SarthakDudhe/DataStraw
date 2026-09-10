import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Layers, 
  Clock, 
  CheckCircle2, 
  CircleDot,
  RotateCcw,
  Download,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { useTickets } from '../hooks/useTickets';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/search/SearchBar';
import StatusFilter from '../components/search/StatusFilter';
import TicketList from '../components/tickets/TicketList';
import ErrorState from '../components/common/ErrorState';
import { exportTicketsToCsv } from '../utils/exportCsv';
import { useToast } from '../components/common/Toast';
import { AVAILABLE_TAGS } from '../utils/tagUtils';

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
    tagFilter,
    setTagFilter,
    sortBy,
    setSortBy,
    clearFilters,
    refetch,
  } = useTickets();
  const { showToast } = useToast();

  const isFiltered = Boolean(
    searchTerm.trim() || 
    (statusFilter && statusFilter !== 'All Statuses' && statusFilter !== 'All') ||
    (tagFilter && tagFilter !== 'all')
  );

  const handleExportCsv = () => {
    if (tickets.length === 0) {
      showToast('No tickets to export', 'info');
      return;
    }
    exportTicketsToCsv(tickets, `support_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Filtered tickets exported to CSV', 'success');
  };

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

  const attentionTickets = useMemo(
    () => tickets
      .filter((ticket) => ticket.status !== 'Closed')
      .sort((a, b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt))
      .slice(0, 3),
    [tickets]
  );

  const newTicketAction = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExportCsv}
        disabled={loading || tickets.length === 0}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md transition-colors disabled:opacity-50"
        title="Download CSV of current tickets"
      >
        <Download className="w-4 h-4 text-slate-500" />
        <span className="hidden sm:inline">Export CSV</span>
      </button>

      <Link
        to="/tickets/new"
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#142a43] hover:bg-[#203a58] rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
      >
        <Plus className="w-4 h-4" />
        <span>Create Ticket</span>
      </Link>
    </div>
  );

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <PageHeader
        title="Customer inbox"
        description="A focused view of conversations that need your team next."
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
              ? 'bg-cyan-50 border-cyan-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Tickets</span>
            <Layers className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
            {loading ? '—' : stats.total}
          </div>
        </button>

        {/* Open */}
        <button
          type="button"
          onClick={() => setStatusFilter('Open')}
          className={`p-3.5 rounded-xl border transition-all text-left group select-none ${
            statusFilter === 'Open'
              ? 'bg-cyan-50 border-cyan-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-cyan-200 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-cyan-700 text-xs font-medium">
            <span>Open</span>
            <CircleDot className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-cyan-700 tracking-tight">
            {loading ? '—' : stats.open}
          </div>
        </button>

        {/* In Progress */}
        <button
          type="button"
          onClick={() => setStatusFilter('In Progress')}
          className={`p-3.5 rounded-xl border transition-all text-left group select-none ${
            statusFilter === 'In Progress'
              ? 'bg-amber-50 border-amber-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-200 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-700 tracking-tight">
            {loading ? '—' : stats.inProgress}
          </div>
        </button>

        {/* Closed */}
        <button
          type="button"
          onClick={() => setStatusFilter('Closed')}
          className={`p-3.5 rounded-xl border transition-all text-left group select-none ${
            statusFilter === 'Closed'
              ? 'bg-emerald-50 border-emerald-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-200 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700 tracking-tight">
            {loading ? '—' : stats.closed}
          </div>
        </button>
      </div>

      {attentionTickets.length > 0 && (
        <section className="ops-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-rose-600"><AlertTriangle className="h-4 w-4" /></span>
              <div><p className="text-sm font-semibold text-slate-900">Attention queue</p><p className="text-xs text-slate-500">Oldest unresolved conversations, ready for a decision.</p></div>
            </div>
            <span className="hidden sm:block text-xs font-medium text-slate-500">{attentionTickets.length} requiring review</span>
          </div>
          <div className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
            {attentionTickets.map((ticket) => {
              const id = ticket.ticket_id || ticket.id;
              return <Link key={id} to={`/tickets/${id}`} className="group flex min-w-0 items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"><div className="min-w-0"><p className="font-mono text-[11px] font-semibold text-cyan-700">#{id}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800 group-hover:text-cyan-700">{ticket.subject}</p><p className="mt-1 text-xs text-slate-500">{ticket.customer_name || ticket.customerName}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-cyan-600" /></Link>;
            })}
          </div>
        </section>
      )}

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="ops-panel p-3.5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
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
              className="appearance-none px-3 py-2 pr-7 bg-white border border-slate-200 hover:border-slate-300 rounded-md text-xs sm:text-sm text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="urgent_sla">Sort: Most Urgent SLA</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="recently_updated">Sort: Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tag Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mr-1 shrink-0">
          Category:
        </span>
        {AVAILABLE_TAGS.map((tag) => {
          const isActive = tagFilter === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => setTagFilter(tag.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 border ${
                isActive
                  ? 'bg-[#142a43] text-white border-[#142a43] shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Active filter count & reset */}
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
              className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-medium transition-colors"
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
