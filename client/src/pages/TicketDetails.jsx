import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Clock, 
  MessageSquare, 
  Save, 
  Loader2, 
  Send,
  CheckCircle2,
  PlayCircle,
  RotateCcw
} from 'lucide-react';
import { getTicket, updateTicket } from '../services/ticketApi';
import { formatDate } from '../utils/formatDate';
import { TICKET_STATUS, TICKET_STATUS_LIST } from '../utils/constants';
import { useToast } from '../components/common/Toast';
import StatusBadge from '../components/tickets/StatusBadge';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import ErrorState from '../components/common/ErrorState';
import AiTicketSummarizer from '../components/tickets/AiTicketSummarizer';
import AiReplyAssistant from '../components/tickets/AiReplyAssistant';
import CustomerHistoryCard from '../components/tickets/CustomerHistoryCard';
import SlaBadge from '../components/tickets/SlaBadge';
import QuickMacros from '../components/tickets/QuickMacros';
import CaseSignalsCard from '../components/tickets/CaseSignalsCard';

const TicketDetails = () => {
  const { ticketId } = useParams();
  const { showToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Form states for updates
  const [status, setStatus] = useState(TICKET_STATUS.OPEN);
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch ticket details
  const loadTicket = useCallback(async () => {
    setLoading(true);
    setError('');
    setNotFound(false);

    try {
      const data = await getTicket(ticketId);
      setTicket(data);
      if (data.status) {
        setStatus(data.status);
      }
    } catch (err) {
      if (err.status === 404 || err.message?.toLowerCase().includes('not found')) {
        setNotFound(true);
      } else {
        setError(err.message || 'Unable to load this ticket.');
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  // Handle Save Changes (Status update and/or Add Note)
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const hasStatusChanged = status !== ticket?.status;
    const hasNewNote = Boolean(note.trim());

    if (!hasStatusChanged && !hasNewNote) {
      showToast('No changes detected to save.', 'info');
      return;
    }

    setIsUpdating(true);

    try {
      const payload = {
        status: status,
      };
      if (hasNewNote) {
        payload.notes = note.trim();
      }

      await updateTicket(ticketId, payload);
      showToast('Ticket updated successfully.', 'success');
      setNote(''); // Clear note input after successful submission
      await loadTicket(); // Refresh ticket data
    } catch (err) {
      const errorMsg = err.message || 'Unable to update ticket.';
      showToast(errorMsg, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInsertAiReply = (draftText) => {
    setNote(draftText);
    showToast('AI draft inserted into note field.', 'info');
  };

  const handleQuickStatusTransition = async (newStatus) => {
    if (newStatus === ticket?.status || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateTicket(ticketId, { status: newStatus });
      setStatus(newStatus);
      showToast(`Status updated to "${newStatus}".`, 'success');
      await loadTicket();
    } catch (err) {
      showToast(err.message || 'Failed to update ticket status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-28"></div>
        <div className="bg-[#111113] border border-zinc-800/80 rounded-xl p-6 space-y-4">
          <div className="h-5 bg-zinc-800 rounded w-24"></div>
          <div className="h-7 bg-zinc-800 rounded w-2/3"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-[#111113] border border-zinc-800/80 rounded-xl"></div>
          <div className="h-72 bg-[#111113] border border-zinc-800/80 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // 2. Not Found State
  if (notFound) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 bg-[#111113] border border-zinc-800/80 rounded-xl shadow-subtle">
        <span className="text-4xl font-mono font-bold text-zinc-500">404</span>
        <h2 className="mt-2 text-lg font-bold text-zinc-100">Ticket not found</h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
          Ticket <code className="font-mono text-zinc-300">#{ticketId}</code> could not be found or may have been removed.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Tickets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. API Error State
  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tickets</span>
        </Link>
        <ErrorState
          title="Unable to load this ticket"
          message={error}
          onRetry={loadTicket}
        />
      </div>
    );
  }

  const currentTicketId = ticket.ticket_id || ticket.id || ticketId;
  const customerName = ticket.customer_name || ticket.customerName || '—';
  const customerEmail = ticket.customer_email || ticket.customerEmail || '';
  const createdAt = ticket.created_at || ticket.createdAt;
  const updatedAt = ticket.updated_at || ticket.updatedAt;

  // Normalize existing notes
  let existingNotes = [];
  if (Array.isArray(ticket.notes)) {
    existingNotes = ticket.notes;
  } else if (typeof ticket.notes === 'string' && ticket.notes.trim()) {
    existingNotes = [{ text: ticket.notes, created_at: ticket.updated_at || ticket.created_at }];
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation Back */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Tickets</span>
        </Link>
      </div>

      {/* Main Ticket Banner Header */}
      <div className="ops-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
              #{currentTicketId}
            </span>
            <StatusBadge status={ticket.status} />
            <SlaBadge createdAt={createdAt} status={ticket.status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Created {formatDate(createdAt)}</span>
          </div>
        </div>

        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight break-words">
          {ticket.subject}
        </h1>
      </div>

      {/* Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): AI Diagnosis, Description & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Intelligence Card */}
          <AiTicketSummarizer ticket={ticket} />

          {/* Issue Description */}
          <section className="ops-panel p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Description
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed break-words bg-slate-50 p-4 rounded-md border border-slate-100">
              {ticket.description || 'No description provided.'}
            </div>
          </section>

          {/* Activity / Notes Timeline */}
          <section className="ops-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Activity & Notes
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                {existingNotes.length} {existingNotes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>

            {existingNotes.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-md bg-slate-50">
                <p className="text-xs text-slate-600">No notes yet.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Use the control panel on the right to add an internal note or status update.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {existingNotes.map((n, idx) => {
                  const noteText = typeof n === 'string' ? n : n.text || n.note;
                  const noteDate = typeof n === 'object' ? n.created_at || n.createdAt : null;

                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-md border border-slate-100 text-xs sm:text-sm text-slate-700 break-words"
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                        {noteText}
                      </p>
                      {noteDate && (
                        <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(noteDate)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Customer Info & Status Update Controls */}
        <div className="space-y-6">
          {/* Customer Information Card */}
          <section className="ops-panel p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Customer Details
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wide block font-medium">
                  Name
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[10px] font-semibold text-amber-800">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {customerName}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wide block font-medium">
                  Email
                </span>
                {customerEmail ? (
                  <a
                    href={`mailto:${customerEmail}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 break-all mt-1"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>{customerEmail}</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 mt-1 block">—</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span className="text-slate-700 font-mono text-[11px]">{formatDate(createdAt, false)}</span>
              </div>
              {updatedAt && (
                <div className="flex items-center justify-between">
                  <span>Updated:</span>
                  <span className="text-slate-700 font-mono text-[11px]">{formatDate(updatedAt, false)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Customer History Card */}
          <CustomerHistoryCard
            customerEmail={customerEmail}
            currentTicketId={currentTicketId}
          />

          <CaseSignalsCard ticket={ticket} />

          {/* Status & Update Controls with AI Reply Assistant */}
          <section className="ops-panel p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Update Ticket
            </h2>

            {/* Quick 1-Click Status Transitions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
                Quick Actions
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {ticket.status !== 'In Progress' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleQuickStatusTransition('In Progress')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors disabled:opacity-50"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>In Progress</span>
                  </button>
                )}
                {ticket.status !== 'Closed' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleQuickStatusTransition('Closed')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve & Close</span>
                  </button>
                )}
                {ticket.status === 'Closed' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleQuickStatusTransition('Open')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen Ticket</span>
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveChanges} className="space-y-4 pt-1">
              <Select
                label="Status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={TICKET_STATUS_LIST}
                disabled={isUpdating}
              />

              {/* AI Smart Reply Assistant integrated directly */}
              <div className="pt-1">
                <AiReplyAssistant
                  ticket={ticket}
                  onInsertReply={handleInsertAiReply}
                />
              </div>

              <QuickMacros
                ticket={ticket}
                onApplyMacro={(macroText) => {
                  setNote((prev) => (prev.trim() ? `${prev}\n\n${macroText}` : macroText));
                  showToast('Quick macro inserted into response field.', 'info');
                }}
                disabled={isUpdating}
              />

              <Textarea
                name="note"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type internal note, resolution steps, or customer reply..."
                disabled={isUpdating}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
