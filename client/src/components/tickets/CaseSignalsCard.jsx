import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  BookOpen, 
  Copy, 
  Gauge, 
  Layers3, 
  Loader2, 
  ThumbsUp, 
  ChevronDown, 
  ChevronUp, 
  Check,
  X,
  Plus,
  ExternalLink,
  Link2,
  ShieldAlert
} from 'lucide-react';
import { 
  getKnowledgeSuggestions, 
  getTicketImpact, 
  incrementArticleHelpful,
  dismissDuplicate,
  linkTicketToIncident,
  createIncidentFromTicket,
  getIncidents
} from '../../services/ticketApi';
import { useToast } from '../common/Toast';

const impactStyles = {
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Moderate: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Normal: 'bg-slate-100 text-slate-600 border-slate-200',
};

const CaseSignalsCard = ({ ticket, onTicketUpdated }) => {
  const [impact, setImpact] = useState(null);
  const [articles, setArticles] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState(null);
  const [helpfulVoted, setHelpfulVoted] = useState({});
  
  // Incident linking / creation UI states
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentMode, setIncidentMode] = useState('link'); // 'link' | 'create'
  const [availableIncidents, setAvailableIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [newIncidentTitle, setNewIncidentTitle] = useState('');
  const [newIncidentUpdate, setNewIncidentUpdate] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [dismissingIds, setDismissingIds] = useState({});

  const { showToast } = useToast();
  const ticketId = ticket?.ticket_id || ticket?.id;
  const currentIncidentId = ticket?.incident_id;

  useEffect(() => {
    let active = true;
    if (!ticketId) return undefined;

    setDuplicates(ticket?.potential_duplicates || []);
    setNewIncidentTitle(ticket?.subject || '');

    Promise.all([
      getTicketImpact(ticketId).catch(() => null),
      getKnowledgeSuggestions({ subject: ticket?.subject, description: ticket?.description }).catch(() => []),
    ]).then(([impactResult, articleResults]) => {
      if (!active) return;
      setImpact(impactResult?.impact || null);
      setArticles(Array.isArray(articleResults) ? articleResults : []);
      setLoading(false);
    });

    return () => { active = false; };
  }, [ticketId, ticket?.subject, ticket?.description, ticket?.potential_duplicates, ticket?.incident_id]);

  const handleHelpfulClick = async (slug, e) => {
    e.stopPropagation();
    if (helpfulVoted[slug]) return;

    try {
      await incrementArticleHelpful(slug);
      setHelpfulVoted((prev) => ({ ...prev, [slug]: true }));
      setArticles((prev) =>
        prev.map((art) => (art.slug === slug ? { ...art, helpful_count: (art.helpful_count || 0) + 1 } : art))
      );
      showToast('Article marked as helpful for this case.', 'success');
    } catch {
      showToast('Unable to record helpful vote.', 'error');
    }
  };

  const handleDismissDuplicate = async (duplicateTicketId) => {
    if (!ticketId || dismissingIds[duplicateTicketId]) return;
    setDismissingIds((prev) => ({ ...prev, [duplicateTicketId]: true }));

    try {
      await dismissDuplicate(ticketId, duplicateTicketId);
      setDuplicates((prev) => prev.filter((d) => d.ticket_id !== duplicateTicketId));
      showToast(`Dismissed duplicate signal ${duplicateTicketId}`, 'success');
      onTicketUpdated?.();
    } catch (err) {
      showToast(err.message || 'Failed to dismiss duplicate', 'error');
    } finally {
      setDismissingIds((prev) => ({ ...prev, [duplicateTicketId]: false }));
    }
  };

  const openIncidentModal = async (mode = 'link') => {
    setIncidentMode(mode);
    setShowIncidentModal(true);
    if (mode === 'link') {
      setLoadingIncidents(true);
      try {
        const list = await getIncidents();
        const openList = (Array.isArray(list) ? list : []).filter((inc) => inc.status !== 'Resolved');
        setAvailableIncidents(openList);
        if (openList.length > 0) {
          setSelectedIncidentId(openList[0].incident_id);
        }
      } catch {
        showToast('Failed to load active incidents', 'error');
      } finally {
        setLoadingIncidents(false);
      }
    }
  };

  const handleLinkToIncident = async (targetIncId) => {
    const incId = targetIncId || selectedIncidentId;
    if (!ticketId || !incId) return;

    setActionInProgress(true);
    try {
      await linkTicketToIncident(ticketId, incId);
      showToast(`Linked ticket to incident ${incId}`, 'success');
      setShowIncidentModal(false);
      onTicketUpdated?.();
    } catch (err) {
      showToast(err.message || 'Failed to link incident', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!ticketId || !newIncidentTitle.trim()) return;

    setActionInProgress(true);
    try {
      const res = await createIncidentFromTicket(ticketId, {
        title: newIncidentTitle.trim(),
        public_update: newIncidentUpdate.trim(),
      });
      showToast(`Created incident ${res.incident?.incident_id || 'new'}`, 'success');
      setShowIncidentModal(false);
      onTicketUpdated?.();
    } catch (err) {
      showToast(err.message || 'Failed to create incident', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const isEmpty = !loading && !impact && !articles.length && !duplicates.length && !currentIncidentId;
  if (isEmpty) return null;

  return (
    <section className="ops-panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-cyan-700" />
          <h2 className="text-sm font-semibold text-slate-900">Case Signals & Intelligence</h2>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      {/* Customer Impact Breakdown */}
      {impact && (
        <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Customer Impact</span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${impactStyles[impact.level] || impactStyles.Normal}`}>
              {impact.level} {impact.score}/100
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            {impact.factors.length ? impact.factors.join(' · ') : 'No elevated customer impact factors detected.'}
          </p>
        </div>
      )}

      {/* Incident Status Banner */}
      {currentIncidentId ? (
        <div className="rounded-md border border-cyan-100 bg-cyan-50/60 p-3">
          <div className="flex items-center justify-between gap-2 text-cyan-900">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-cyan-700 shrink-0" />
              <div>
                <span className="text-xs font-semibold">Linked to Incident</span>
                <span className="ml-1.5 font-mono text-xs font-bold text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded">
                  {currentIncidentId}
                </span>
              </div>
            </div>
            <Link
              to="/incidents"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-700 hover:text-cyan-900 underline"
            >
              <span>View Ops</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="mt-2 text-[11px] text-cyan-800/80">
            Customer updates and status changes are synchronized with this active incident cluster.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/70 p-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldAlert className="h-4 w-4 text-slate-400" />
            <span>Not linked to any incident</span>
          </div>
          <button
            type="button"
            onClick={() => openIncidentModal('create')}
            className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:text-cyan-800 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Escalate Incident</span>
          </button>
        </div>
      )}

      {/* Potential Duplicate Tickets & Agent Controls */}
      {duplicates.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold">Potential Duplicate Cases ({duplicates.length})</span>
            </div>
            <span className="text-[11px] text-slate-400">Content overlap</span>
          </div>

          <div className="space-y-2">
            {duplicates.map((dup) => {
              const isDismissing = dismissingIds[dup.ticket_id];
              return (
                <div
                  key={dup.ticket_id}
                  className="rounded-md border border-amber-100 bg-amber-50/40 p-3 space-y-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/tickets/${dup.ticket_id}`}
                          className="font-mono text-xs font-bold text-amber-900 hover:underline inline-flex items-center gap-1"
                        >
                          #{dup.ticket_id}
                          <ExternalLink className="h-2.5 w-2.5 text-amber-700" />
                        </Link>
                        <span className="rounded-full bg-amber-100 border border-amber-200 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800">
                          {dup.confidence}% match
                        </span>
                        {dup.status && (
                          <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                            {dup.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-medium line-clamp-1">
                        {dup.subject}
                      </p>
                    </div>

                    {/* Duplicate Dismiss Action */}
                    <button
                      type="button"
                      disabled={isDismissing}
                      onClick={() => handleDismissDuplicate(dup.ticket_id)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors disabled:opacity-50"
                      title="Dismiss false duplicate"
                    >
                      {isDismissing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Shared Terms Badges */}
                  {dup.shared_terms && dup.shared_terms.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400">Terms:</span>
                      {dup.shared_terms.map((term) => (
                        <span key={term} className="text-[10px] font-mono bg-white border border-amber-200 text-amber-800 px-1.5 py-0.2 rounded">
                          {term}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Incident Link from Duplicate */}
                  <div className="flex items-center justify-between pt-1 border-t border-amber-100/70 text-[11px]">
                    {dup.incident_id && !currentIncidentId ? (
                      <button
                        type="button"
                        onClick={() => handleLinkToIncident(dup.incident_id)}
                        disabled={actionInProgress}
                        className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-900 font-semibold"
                      >
                        <Link2 className="h-3 w-3" />
                        <span>Join Incident {dup.incident_id}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500">Customer: {dup.customer_name || 'Anonymous'}</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDismissDuplicate(dup.ticket_id)}
                      disabled={isDismissing}
                      className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Not a duplicate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Knowledge Guidance */}
      {articles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-700" />
              <span className="text-xs font-semibold">Suggested Knowledge</span>
            </div>
            <span className="text-[11px] text-slate-400">Approved context</span>
          </div>

          <div className="space-y-2">
            {articles.map((article) => {
              const isExpanded = expandedSlug === article.slug;
              const isVoted = helpfulVoted[article.slug];

              return (
                <div
                  key={article.slug}
                  className="rounded-md border border-slate-100 bg-white p-3 space-y-2 transition-colors"
                >
                  <div
                    className="flex items-start justify-between gap-2 cursor-pointer select-none"
                    onClick={() => setExpandedSlug(isExpanded ? null : article.slug)}
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 hover:text-cyan-700 transition-colors">
                        {article.title}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        {article.summary}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                      aria-label={isExpanded ? 'Collapse guidance' : 'Expand guidance'}
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Content View */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-md leading-relaxed whitespace-pre-wrap">
                      {article.content}
                    </div>
                  )}

                  {/* Card Actions: Helpful Button */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      {article.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleHelpfulClick(article.slug, e)}
                      disabled={isVoted}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                        isVoted
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      title="Confirm this approved guidance is helpful for this ticket"
                    >
                      {isVoted ? <Check className="h-3 w-3" /> : <ThumbsUp className="h-3 w-3" />}
                      <span>{isVoted ? 'Helpful' : 'Mark helpful'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Incident Modal (Link or Create) */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-cyan-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {incidentMode === 'create' ? 'Create Incident Cluster' : 'Link to Existing Incident'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIncidentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex border border-slate-200 rounded-md p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => openIncidentModal('create')}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  incidentMode === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                New Incident
              </button>
              <button
                type="button"
                onClick={() => openIncidentModal('link')}
                className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                  incidentMode === 'link' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Existing Incident
              </button>
            </div>

            {/* Create Mode Form */}
            {incidentMode === 'create' ? (
              <form onSubmit={handleCreateIncident} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Incident Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newIncidentTitle}
                    onChange={(e) => setNewIncidentTitle(e.target.value)}
                    placeholder="e.g. Payment gateway 504 gateway timeout spike"
                    className="w-full text-xs rounded border border-slate-200 p-2 text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Public Broadcast Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={newIncidentUpdate}
                    onChange={(e) => setNewIncidentUpdate(e.target.value)}
                    placeholder="e.g. Engineering is currently investigating payment gateway latency..."
                    className="w-full text-xs rounded border border-slate-200 p-2 text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowIncidentModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionInProgress || !newIncidentTitle.trim()}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-700 hover:bg-cyan-800 rounded transition-colors disabled:opacity-50"
                  >
                    {actionInProgress ? 'Creating...' : 'Create Incident'}
                  </button>
                </div>
              </form>
            ) : (
              /* Link Mode */
              <div className="space-y-3">
                {loadingIncidents ? (
                  <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Loading active incidents...</span>
                  </div>
                ) : availableIncidents.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-xs text-slate-500">No active incidents found.</p>
                    <button
                      type="button"
                      onClick={() => setIncidentMode('create')}
                      className="text-xs text-cyan-700 hover:underline font-semibold"
                    >
                      Create a new incident instead
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Active Incident
                      </label>
                      <select
                        value={selectedIncidentId}
                        onChange={(e) => setSelectedIncidentId(e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 p-2 text-slate-800 focus:outline-none focus:border-cyan-500"
                      >
                        {availableIncidents.map((inc) => (
                          <option key={inc.incident_id} value={inc.incident_id}>
                            [{inc.incident_id}] {inc.title} ({inc.status}, {inc.ticket_count || inc.ticket_ids?.length || 0} tickets)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowIncidentModal(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded border border-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={actionInProgress || !selectedIncidentId}
                        onClick={() => handleLinkToIncident()}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-700 hover:bg-cyan-800 rounded transition-colors disabled:opacity-50"
                      >
                        {actionInProgress ? 'Linking...' : 'Link to Incident'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CaseSignalsCard;
