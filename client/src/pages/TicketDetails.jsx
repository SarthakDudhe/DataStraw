import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/tickets/StatusBadge';
import TicketMeta from '../components/tickets/TicketMeta';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import { TICKET_STATUS, TICKET_STATUS_LIST } from '../utils/constants';

const TicketDetails = () => {
  const { ticketId } = useParams();

  // Skeleton state placeholder
  const [ticketStatus, setTicketStatus] = useState(TICKET_STATUS.OPEN);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([]);

  const handleStatusChange = (e) => {
    setTicketStatus(e.target.value);
    console.log('Status update queued:', e.target.value);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteEntry = {
      id: Date.now(),
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [noteEntry, ...prev]);
    setNewNote('');
  };

  const backAction = (
    <Link
      to="/"
      className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
    >
      &larr; Back to Tickets
    </Link>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Ticket #${ticketId}`}
        description="Detailed view and resolution management for this support ticket."
        action={backAction}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-mono font-medium text-slate-500 uppercase">
                  Subject
                </span>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                  Ticket Subject Placeholder
                </h2>
              </div>
              <StatusBadge status={ticketStatus} />
            </div>

            <div>
              <span className="text-xs font-mono font-medium text-slate-500 uppercase">
                Description
              </span>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                Ticket description details will be loaded from the backend API.
              </p>
            </div>
          </section>

          {/* Notes and Comments Section */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">
              Notes & Activity
            </h3>

            <form onSubmit={handleAddNote} className="mb-6">
              <Textarea
                name="note"
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note or update comment..."
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" variant="secondary">
                  Add Note
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No notes recorded yet for this ticket.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-slate-50 rounded-md border border-slate-100 text-sm text-slate-700"
                  >
                    <p className="text-slate-800">{note.text}</p>
                    <span className="block mt-1 text-[11px] text-slate-400">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Ticket Information
            </h3>

            <div>
              <span className="text-xs text-slate-500 block">Customer Name</span>
              <span className="text-sm font-medium text-slate-900">—</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Customer Email</span>
              <span className="text-sm font-medium text-slate-900">—</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Update Status</span>
              <Select
                name="status"
                value={ticketStatus}
                onChange={handleStatusChange}
                options={TICKET_STATUS_LIST}
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <TicketMeta
                createdAt={new Date().toISOString()}
                updatedAt={new Date().toISOString()}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
