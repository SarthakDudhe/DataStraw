import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Layers, 
  Users, 
  TrendingUp,
  RotateCw
} from 'lucide-react';
import { getTickets } from '../services/ticketApi';
import PageHeader from '../components/common/PageHeader';
import { calculateSlaStatus } from '../utils/slaUtils';
import { exportTicketsToCsv } from '../utils/exportCsv';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';

const Analytics = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      showToast('Unable to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute rich metrics
  const analytics = useMemo(() => {
    const total = tickets.length;
    if (total === 0) {
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        closed: 0,
        slaHealthy: 0,
        slaUrgent: 0,
        slaBreached: 0,
        slaMet: 0,
        slaComplianceRate: 100,
        resolutionRate: 0,
        mttrHours: '0.0',
        topRequesters: [],
      };
    }

    let open = 0;
    let inProgress = 0;
    let closed = 0;
    let slaHealthy = 0;
    let slaUrgent = 0;
    let slaBreached = 0;
    let slaMet = 0;
    let totalResolvedDurationMs = 0;
    let resolvedCount = 0;

    const requestersMap = {};

    tickets.forEach((t) => {
      const s = (t.status || '').toLowerCase();
      if (s === 'open') open++;
      else if (s === 'in progress') inProgress++;
      else if (s === 'closed') closed++;

      const sla = calculateSlaStatus(t.created_at || t.createdAt, t.status);
      if (sla.status === 'healthy') slaHealthy++;
      else if (sla.status === 'urgent') slaUrgent++;
      else if (sla.status === 'breached') slaBreached++;
      else if (sla.status === 'met') slaMet++;

      // MTTR calculation
      if (s === 'closed') {
        const cTime = new Date(t.created_at || t.createdAt).getTime();
        const uTime = new Date(t.updated_at || t.updatedAt || cTime).getTime();
        if (uTime >= cTime) {
          totalResolvedDurationMs += (uTime - cTime);
          resolvedCount++;
        }
      }

      // Top requesters
      const email = t.customer_email || t.customerEmail || 'Unknown';
      const name = t.customer_name || t.customerName || 'Anonymous';
      if (!requestersMap[email]) {
        requestersMap[email] = { name, email, count: 0, lastTicket: t.subject };
      }
      requestersMap[email].count++;
    });

    const compliantCount = total - slaBreached;
    const slaComplianceRate = total > 0 ? Math.round((compliantCount / total) * 100) : 100;
    const resolutionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    const avgDurationHours = resolvedCount > 0 
      ? (totalResolvedDurationMs / (resolvedCount * 1000 * 60 * 60)).toFixed(1)
      : '—';

    const topRequesters = Object.values(requestersMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      open,
      inProgress,
      closed,
      slaHealthy,
      slaUrgent,
      slaBreached,
      slaMet,
      slaComplianceRate,
      resolutionRate,
      mttrHours: avgDurationHours,
      topRequesters,
    };
  }, [tickets]);

  const handleExportCsv = () => {
    if (tickets.length === 0) {
      showToast('No tickets to export', 'info');
      return;
    }
    exportTicketsToCsv(tickets, `support_crm_report_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('CSV export downloaded successfully', 'success');
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={loadData}
        disabled={loading}
        className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        title="Refresh Metrics"
      >
        <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
      </button>

      <Button
        variant="secondary"
        onClick={handleExportCsv}
        disabled={loading || tickets.length === 0}
      >
        <Download className="w-4 h-4 mr-1.5 text-zinc-400" />
        <span>Export CSV Report</span>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & SLA Analytics"
        description="Real-time operational metrics, resolution velocity, and SLA compliance performance."
        action={headerActions}
      />

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Volume */}
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Ticket Volume</span>
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-100 tracking-tight">
            {loading ? '—' : analytics.total}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">All registered support cases</p>
        </div>

        {/* SLA Compliance Rate */}
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>SLA Compliance</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 tracking-tight flex items-baseline gap-1">
            <span>{loading ? '—' : `${analytics.slaComplianceRate}%`}</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {analytics.slaBreached > 0 ? `${analytics.slaBreached} tickets breached target SLA` : 'All tickets within SLA target'}
          </p>
        </div>

        {/* Resolution Rate */}
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-400 tracking-tight">
            {loading ? '—' : `${analytics.resolutionRate}%`}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {analytics.closed} of {analytics.total} cases closed
          </p>
        </div>

        {/* Mean Time to Resolution (MTTR) */}
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Mean Time to Resolve</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400 tracking-tight">
            {loading ? '—' : `${analytics.mttrHours}h`}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Average resolution turnaround</p>
        </div>
      </div>

      {/* Two Column Section: Pipeline Distribution & SLA Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Pipeline Distribution */}
        <section className="bg-[#111113] border border-zinc-800/80 rounded-xl p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Pipeline Status Distribution
              </h2>
            </div>
            <span className="text-xs text-zinc-500">Live Breakdown</span>
          </div>

          {/* Visual Stacked Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex">
              {analytics.total > 0 && (
                <>
                  <div
                    style={{ width: `${(analytics.open / analytics.total) * 100}%` }}
                    className="bg-blue-500 transition-all duration-500"
                    title={`Open: ${analytics.open}`}
                  />
                  <div
                    style={{ width: `${(analytics.inProgress / analytics.total) * 100}%` }}
                    className="bg-amber-500 transition-all duration-500"
                    title={`In Progress: ${analytics.inProgress}`}
                  />
                  <div
                    style={{ width: `${(analytics.closed / analytics.total) * 100}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Closed: ${analytics.closed}`}
                  />
                </>
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                <span className="text-zinc-400">Open: <strong className="text-zinc-200">{analytics.open}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-zinc-400">In Progress: <strong className="text-zinc-200">{analytics.inProgress}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-zinc-400">Closed: <strong className="text-zinc-200">{analytics.closed}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* SLA Health Status Breakdown */}
        <section className="bg-[#111113] border border-zinc-800/80 rounded-xl p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                SLA Urgency Monitor
              </h2>
            </div>
            <span className="text-xs text-zinc-500">Target 12h SLA</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-red-400 font-medium">Breached</span>
                <span className="font-mono text-base font-bold text-red-400">{analytics.slaBreached}</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Missed SLA target</p>
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-medium">Warning (&lt;3h)</span>
                <span className="font-mono text-base font-bold text-amber-400">{analytics.slaUrgent}</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Expiring soon</p>
            </div>

            <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-medium">Healthy Active</span>
                <span className="font-mono text-base font-bold text-zinc-200">{analytics.slaHealthy}</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">On schedule</p>
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-medium">SLA Met</span>
                <span className="font-mono text-base font-bold text-emerald-400">{analytics.slaMet}</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Resolved on time</p>
            </div>
          </div>
        </section>
      </div>

      {/* Top Requesters Section */}
      <section className="bg-[#111113] border border-zinc-800/80 rounded-xl p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Top Customer Requesters
            </h2>
          </div>
          <span className="text-xs text-zinc-500">Most active accounts</span>
        </div>

        {analytics.topRequesters.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">
            No customer requester data available yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {analytics.topRequesters.map((req, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 shrink-0">
                    {req.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{req.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{req.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {req.count} {req.count === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Analytics;
