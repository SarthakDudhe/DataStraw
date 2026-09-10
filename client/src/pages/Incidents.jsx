import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock3, 
  Loader2, 
  RefreshCw, 
  Layers3, 
  Send, 
  GitMerge, 
  Users, 
  Ticket as TicketIcon, 
  ExternalLink, 
  X, 
  ChevronRight,
  Search,
  MessageSquare
} from 'lucide-react';
import { 
  getIncidents, 
  getIncident, 
  updateIncident, 
  broadcastIncidentNote, 
  mergeIncidents 
} from '../services/ticketApi';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import { useToast } from '../components/common/Toast';
import { formatDate } from '../utils/formatDate';

const statusStyles = {
  Investigating: 'bg-rose-50 border-rose-200 text-rose-700',
  Monitoring: 'bg-amber-50 border-amber-200 text-amber-700',
  Resolved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

const impactBadgeStyles = {
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Moderate: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Normal: 'bg-slate-100 text-slate-600 border-slate-200',
};

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState('');
  
  // Drill-down detail modal state
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [incidentDetail, setIncidentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('tickets'); // 'tickets' | 'customers' | 'broadcast'
  
  // Broadcast note composer state
  const [broadcastNote, setBroadcastNote] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  // Merge modal state
  const [mergeSourceIncident, setMergeSourceIncident] = useState(null);
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [merging, setMerging] = useState(false);

  const { showToast } = useToast();

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const results = await getIncidents();
      setIncidents(Array.isArray(results) ? results : []);
    } catch (error) {
      showToast(error.message || 'Unable to load incidents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q || 
        inc.incident_id?.toLowerCase().includes(q) || 
        inc.title?.toLowerCase().includes(q) || 
        inc.public_update?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [incidents, statusFilter, searchTerm]);

  // Status metrics
  const counts = useMemo(() => {
    let investigating = 0;
    let monitoring = 0;
    let resolved = 0;
    incidents.forEach((inc) => {
      if (inc.status === 'Investigating') investigating++;
      else if (inc.status === 'Monitoring') monitoring++;
      else if (inc.status === 'Resolved') resolved++;
    });
    return { all: incidents.length, investigating, monitoring, resolved };
  }, [incidents]);

  // Load detailed incident drill-down
  const handleOpenDetail = async (incidentId, initialTab = 'tickets') => {
    setSelectedIncidentId(incidentId);
    setDetailTab(initialTab);
    setDetailLoading(true);
    try {
      const detail = await getIncident(incidentId);
      setIncidentDetail(detail);
      setBroadcastNote(detail.public_update || '');
    } catch (error) {
      showToast(error.message || 'Unable to load incident details', 'error');
      setSelectedIncidentId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    setUpdating(incidentId);
    try {
      await updateIncident(incidentId, { status: newStatus });
      showToast(`${incidentId} status updated to ${newStatus}`, 'success');
      await loadIncidents();
      if (incidentDetail?.incident_id === incidentId) {
        const detail = await getIncident(incidentId);
        setIncidentDetail(detail);
      }
    } catch (error) {
      showToast(error.message || 'Unable to update status', 'error');
    } finally {
      setUpdating('');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!incidentDetail || !broadcastNote.trim()) return;

    setBroadcasting(true);
    try {
      const res = await broadcastIncidentNote(incidentDetail.incident_id, broadcastNote.trim());
      showToast(`Broadcast note added to ${res.broadcast_count} linked ticket(s)`, 'success');
      // Refresh details and list
      const refreshed = await getIncident(incidentDetail.incident_id);
      setIncidentDetail(refreshed);
      loadIncidents();
    } catch (error) {
      showToast(error.message || 'Failed to broadcast incident note', 'error');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleMergeSubmit = async (e) => {
    e.preventDefault();
    if (!mergeSourceIncident || !mergeTargetId) return;

    setMerging(true);
    try {
      const res = await mergeIncidents(mergeSourceIncident.incident_id, mergeTargetId);
      showToast(`Merged ${res.merged_count} tickets into ${mergeTargetId}`, 'success');
      setMergeSourceIncident(null);
      setMergeTargetId('');
      if (selectedIncidentId === mergeSourceIncident.incident_id) {
        setSelectedIncidentId(null);
      }
      loadIncidents();
    } catch (error) {
      showToast(error.message || 'Failed to merge incidents', 'error');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Operations"
        description="Cluster related customer tickets, coordinate unified team responses, and broadcast live incident notes."
        action={
          <button
            type="button"
            className="ops-icon-button"
            onClick={loadIncidents}
            title="Refresh incidents"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('All')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'All' ? 'bg-cyan-50 border-cyan-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Clusters</span>
            <Layers3 className="h-4 w-4 text-cyan-700" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{counts.all}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Investigating')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Investigating' ? 'bg-rose-50 border-rose-300 shadow-sm' : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
            <span>Investigating</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-700">{counts.investigating}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Monitoring')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Monitoring' ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Monitoring</span>
            <Clock3 className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-700">{counts.monitoring}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Resolved')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Resolved' ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700">{counts.resolved}</div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="ops-panel p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incident ID, title, or updates..."
            className="w-full text-xs rounded-md border border-slate-200 pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['All', 'Investigating', 'Monitoring', 'Resolved'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-700" />
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="ops-panel flex flex-col items-center px-6 py-16 text-center">
          <AlertTriangle className="h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-sm font-semibold text-slate-800">No matching incidents found</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {searchTerm || statusFilter !== 'All'
              ? 'Try adjusting your search query or status filter.'
              : 'When tickets cluster around the same root cause, Deskline organizes them here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => {
            const isUpdating = updating === incident.incident_id;
            return (
              <section
                key={incident.incident_id}
                className="ops-panel p-5 space-y-3 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                        {incident.incident_id}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[incident.status] || statusStyles.Investigating}`}>
                        {incident.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <TicketIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span>{incident.ticket_count || incident.ticket_ids?.length || 0} linked tickets</span>
                      </span>
                      {incident.updated_at && (
                        <span className="text-[11px] text-slate-400">
                          &bull; Updated {formatDate(incident.updated_at, false)}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                      {incident.title}
                    </h2>

                    {incident.public_update ? (
                      <div className="mt-2 rounded-md bg-slate-50 border border-slate-100 p-3 text-xs leading-relaxed text-slate-700">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-800 mb-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Broadcast Status Note</span>
                        </div>
                        <p className="whitespace-pre-wrap">{incident.public_update}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No broadcast note published yet.</p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(incident.incident_id, 'tickets')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-md shadow-sm transition-colors"
                    >
                      <Layers3 className="h-3.5 w-3.5" />
                      <span>Drill-Down ({incident.ticket_count || incident.ticket_ids?.length || 0})</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(incident.incident_id, 'broadcast')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors"
                        title="Broadcast update to all linked tickets"
                      >
                        <Send className="h-3 w-3 text-slate-500" />
                        <span>Broadcast</span>
                      </button>

                      {incident.status !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMergeSourceIncident(incident);
                            const other = incidents.find((i) => i.incident_id !== incident.incident_id && i.status !== 'Resolved');
                            setMergeTargetId(other?.incident_id || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors"
                          title="Merge into another incident"
                        >
                          <GitMerge className="h-3 w-3 text-slate-500" />
                          <span>Merge</span>
                        </button>
                      )}

                      {/* Advance status */}
                      {incident.status !== 'Resolved' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(
                            incident.incident_id, 
                            incident.status === 'Investigating' ? 'Monitoring' : 'Resolved'
                          )}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : incident.status === 'Investigating' ? (
                            <Clock3 className="h-3 w-3 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          )}
                          <span>{incident.status === 'Investigating' ? 'Monitor' : 'Resolve'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Drill-down / Detailed Incident Drawer Modal */}
      {selectedIncidentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-cyan-700 bg-white border border-cyan-200 px-2 py-1 rounded">
                  {selectedIncidentId}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[incidentDetail?.status] || statusStyles.Investigating}`}>
                  {incidentDetail?.status || 'Loading...'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-md">
                  {incidentDetail?.title || 'Incident Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncidentId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sub-header Tabs */}
            <div className="flex items-center border-b border-slate-200 px-6 text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setDetailTab('tickets')}
                className={`py-3 px-4 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
                  detailTab === 'tickets' ? 'border-cyan-600 text-cyan-800 font-semibold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <TicketIcon className="h-4 w-4" />
                <span>Linked Tickets ({incidentDetail?.tickets?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailTab('customers')}
                className={`py-3 px-4 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
                  detailTab === 'customers' ? 'border-cyan-600 text-cyan-800 font-semibold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Affected Customers ({incidentDetail?.affected_customers?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailTab('broadcast')}
                className={`py-3 px-4 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
                  detailTab === 'broadcast' ? 'border-cyan-600 text-cyan-800 font-semibold' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>Broadcast Note</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {detailLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-700" />
                </div>
              ) : !incidentDetail ? (
                <p className="text-sm text-slate-500 text-center py-8">Failed to load incident details.</p>
              ) : (
                <>
                  {/* Linked Tickets Tab */}
                  {detailTab === 'tickets' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                        <span>All tickets grouped into this incident:</span>
                        <span>{incidentDetail.tickets.length} total</span>
                      </div>
                      {incidentDetail.tickets.map((t) => (
                        <div
                          key={t.ticket_id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                        >
                          <div className="space-y-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/tickets/${t.ticket_id}`}
                                className="font-mono text-xs font-bold text-cyan-700 hover:underline inline-flex items-center gap-1"
                              >
                                #{t.ticket_id}
                                <ExternalLink className="h-3 w-3 text-cyan-600" />
                              </Link>
                              <span className="text-xs text-slate-500 font-medium truncate">
                                {t.customer_name} ({t.customer_email})
                              </span>
                              {t.impact_level && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${impactBadgeStyles[t.impact_level] || impactBadgeStyles.Normal}`}>
                                  {t.impact_level} {t.impact_score}/100
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-800 font-medium truncate">
                              {t.subject}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Affected Customers Tab */}
                  {detailTab === 'customers' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">
                        Distinct customers affected across all tickets linked to this incident:
                      </p>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                        {incidentDetail.affected_customers?.map((cust) => (
                          <div key={cust.email} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{cust.name}</p>
                              <a
                                href={`mailto:${cust.email}`}
                                className="text-xs text-cyan-700 hover:underline"
                              >
                                {cust.email}
                              </a>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                {cust.ticket_count} {cust.ticket_count === 1 ? 'ticket' : 'tickets'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Broadcast Note Tab */}
                  {detailTab === 'broadcast' && (
                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Operational Update / Public Broadcast Note
                        </label>
                        <p className="text-xs text-slate-500 mb-2">
                          Sending this note records an audit note onto every linked ticket and updates the public incident timeline for customers and agents.
                        </p>
                        <textarea
                          rows={4}
                          required
                          value={broadcastNote}
                          onChange={(e) => setBroadcastNote(e.target.value)}
                          placeholder="e.g. Engineering has applied a hotfix to the payment service and is monitoring recovery..."
                          className="w-full text-xs rounded-md border border-slate-200 p-3 text-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                          Applies to {incidentDetail.tickets?.length || 0} active tickets
                        </span>
                        <button
                          type="submit"
                          disabled={broadcasting || !broadcastNote.trim()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-md shadow-sm transition-colors disabled:opacity-50"
                        >
                          {broadcasting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          <span>{broadcasting ? 'Broadcasting...' : 'Broadcast to All Linked Tickets'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer Controls */}
            {incidentDetail && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Status:</span>
                  {['Investigating', 'Monitoring', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updating === incidentDetail.incident_id || incidentDetail.status === st}
                      onClick={() => handleStatusChange(incidentDetail.incident_id, st)}
                      className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                        incidentDetail.status === st
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIncidentId(null)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-200 border border-slate-200"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Merge Incident Modal */}
      {mergeSourceIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GitMerge className="h-5 w-5 text-cyan-700" />
                <h3 className="text-sm font-bold text-slate-900">Merge Incident Clusters</h3>
              </div>
              <button
                type="button"
                onClick={() => setMergeSourceIncident(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to merge <strong className="font-mono text-cyan-700">{mergeSourceIncident.incident_id}</strong> into another incident. All its linked tickets will be moved to the target incident and this incident will be closed as merged.
            </p>

            <form onSubmit={handleMergeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Target Incident
                </label>
                <select
                  required
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full text-xs rounded-md border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  {incidents
                    .filter((inc) => inc.incident_id !== mergeSourceIncident.incident_id && inc.status !== 'Resolved')
                    .map((inc) => (
                      <option key={inc.incident_id} value={inc.incident_id}>
                        [{inc.incident_id}] {inc.title} ({inc.ticket_count || inc.ticket_ids?.length || 0} tickets)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMergeSourceIncident(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={merging || !mergeTargetId}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-cyan-700 hover:bg-cyan-800 rounded-md transition-colors disabled:opacity-50"
                >
                  {merging && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>{merging ? 'Merging...' : 'Confirm Merge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
