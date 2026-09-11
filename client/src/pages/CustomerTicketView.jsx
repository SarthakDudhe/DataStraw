import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import StatusBadge from '../components/tickets/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../services/ticketApi';
import { formatDate } from '../utils/formatDate';

const CustomerTicketView = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchTicket = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await ticketApi.getTicket(ticketId);
        if (!isMounted) return;

        // Security check: verify this ticket belongs to the logged in customer
        if (
          user?.email &&
          data.customer_email &&
          data.customer_email.toLowerCase() !== user.email.toLowerCase()
        ) {
          setError('You do not have permission to view this ticket.');
          setTicket(null);
          return;
        }

        setTicket(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Unable to load ticket details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTicket();
    return () => {
      isMounted = false;
    };
  }, [ticketId, user?.email]);

  const getStepState = (targetStatus) => {
    const status = ticket?.status || 'Open';
    if (status === 'Closed') return 'completed';
    if (status === 'In Progress') {
      if (targetStatus === 'Open') return 'completed';
      if (targetStatus === 'In Progress') return 'current';
      return 'upcoming';
    }
    // Open
    if (targetStatus === 'Open') return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <CustomerNavbar activeTab="tickets" onTabChange={() => navigate('/portal')} />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/portal"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            &larr; Back to My Tickets
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-xs text-slate-500 font-medium">Loading ticket details...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-white border border-red-200 rounded-2xl text-center shadow-xs">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">Ticket Access Issue</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">{error}</p>
            <Link
              to="/portal"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Return to Help Center
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {ticket.ticket_id}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {ticket.subject}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Created on {formatDate(ticket.created_at)}
                  </p>
                </div>
              </div>

              {/* Resolution Progress Bar */}
              <div className="pt-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-4">
                  Request Progress
                </span>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        getStepState('Open') === 'completed' || getStepState('Open') === 'current'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      ✓
                    </div>
                    <span className="text-xs font-semibold text-slate-800 mt-2">Received</span>
                    <span className="text-[10px] text-slate-500">Ticket logged</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        getStepState('In Progress') === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : getStepState('In Progress') === 'current'
                          ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {getStepState('In Progress') === 'completed' ? '✓' : '2'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 mt-2">Under Review</span>
                    <span className="text-[10px] text-slate-500">Agent investigating</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        ticket?.status === 'Closed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {ticket?.status === 'Closed' ? '✓' : '3'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 mt-2">Resolved</span>
                    <span className="text-[10px] text-slate-500">Closed by support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Your Issue Description
                </h3>
                <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">
                  {ticket.description}
                </p>
              </div>

              {/* Notes / Activity Feed for Customer */}
              {ticket.notes && ticket.notes.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Support Activity & Comments
                  </h3>
                  <div className="space-y-3">
                    {ticket.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs"
                      >
                        <div className="flex items-center justify-between text-indigo-900 font-semibold mb-1">
                          <span>Support Staff Note</span>
                          <span className="text-[10px] text-indigo-600 font-normal">
                            {formatDate(note.created_at || note.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-700">{note.note_text || note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assistance card */}
            <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span>Have additional information regarding this ticket?</span>
              <span className="font-semibold text-indigo-600 font-mono">
                Reply with #{ticket.ticket_id} in subject
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerTicketView;
