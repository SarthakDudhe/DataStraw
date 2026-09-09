import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTicket, updateTicket } from '../services/ticketApi';
import { formatDate } from '../utils/formatDate';
import { TICKET_STATUS, TICKET_STATUS_LIST } from '../utils/constants';
import { useToast } from '../components/common/Toast';
import StatusBadge from '../components/tickets/StatusBadge';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import ErrorState from '../components/common/ErrorState';

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

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-28"></div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white border border-slate-200 rounded-lg"></div>
          <div className="h-64 bg-white border border-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // 2. Not Found State
  if (notFound) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <span className="text-4xl font-mono font-bold text-slate-400">404</span>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Ticket not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          Ticket <code className="font-mono font-semibold">#{ticketId}</code> may have been deleted or does not exist.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary">&larr; Back to Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. API Error State
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-6"
        >
          &larr; Back to Tickets
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

  // Process existing notes
  let existingNotes = [];
  if (Array.isArray(ticket.notes)) {
    existingNotes = ticket.notes;
  } else if (typeof ticket.notes === 'string' && ticket.notes.trim()) {
    existingNotes = [{ text: ticket.notes, created_at: ticket.updated_at || ticket.created_at }];
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          &larr; Back to Tickets
        </Link>
      </div>

      {/* Ticket Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
              #{currentTicketId}
            </span>
            <StatusBadge status={ticket.status} />
          </div>
          <span className="text-xs text-slate-500">
            Created: {formatDate(createdAt)}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
          {ticket.subject}
        </h1>
      </div>

      {/* Two-Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Description
            </h2>
            <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed break-words bg-slate-50/50 p-4 rounded-md border border-slate-100">
              {ticket.description || 'No description provided.'}
            </div>
          </section>

          {/* Notes & Activity Log */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Internal Notes & Comments
            </h2>

            {existingNotes.length === 0 ? (
              <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-md bg-slate-50/50">
                <p className="text-xs text-slate-500">No notes yet.</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add the first internal note below.
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
                      className="p-4 bg-slate-50 rounded-md border border-slate-100 text-sm text-slate-800 break-words"
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{noteText}</p>
                      {noteDate && (
                        <span className="block mt-2 text-xs text-slate-400">
                          {formatDate(noteDate)}
                        </span>
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
          <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Customer Information
            </h2>

            <div>
              <span className="text-xs text-slate-500 block">Customer Name</span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {customerName}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Customer Email</span>
              {customerEmail ? (
                <a
                  href={`mailto:${customerEmail}`}
                  className="text-sm font-medium text-blue-600 hover:underline break-all mt-0.5 inline-block"
                >
                  {customerEmail}
                </a>
              ) : (
                <p className="text-sm text-slate-400 mt-0.5">—</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div>
                <span className="font-medium text-slate-600">Created:</span>{' '}
                {formatDate(createdAt)}
              </div>
              {updatedAt && (
                <div>
                  <span className="font-medium text-slate-600">Updated:</span>{' '}
                  {formatDate(updatedAt)}
                </div>
              )}
            </div>
          </section>

          {/* Update Ticket Controls */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Update Ticket
            </h2>

            <form onSubmit={handleSaveChanges} className="space-y-4">
              <Select
                label="Ticket Status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={TICKET_STATUS_LIST}
                disabled={isUpdating}
              />

              <Textarea
                label="Add a note"
                name="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type internal note or update message..."
                disabled={isUpdating}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
