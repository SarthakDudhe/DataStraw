import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  ShieldCheck,
  LifeBuoy,
  Send,
  Star,
  Check,
  User
} from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import StatusBadge from '../components/tickets/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../services/ticketApi';
import { formatDate } from '../utils/formatDate';
import { useToast } from '../components/common/Toast';

const CustomerTicketView = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Two-way reply state
  const [customerReply, setCustomerReply] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // CSAT rating state
  const [csatRating, setCsatRating] = useState(() => {
    try {
      return localStorage.getItem(`csat_${ticketId}`) || null;
    } catch {
      return null;
    }
  });
  const [isClosingTicket, setIsClosingTicket] = useState(false);

  const fetchTicket = async (isMounted = true) => {
    setLoading(true);
    setError('');
    try {
      const data = await ticketApi.getTicket(ticketId);
      if (!isMounted) return;

      if (
        user?.email &&
        data.customer_email &&
        data.customer_email.toLowerCase() !== user.email.toLowerCase()
      ) {
        setError('Access restricted: You do not have permission to view tickets belonging to another account.');
        setTicket(null);
        return;
      }

      setTicket(data);
    } catch (err) {
      if (!isMounted) return;
      setError(err.message || 'Unable to retrieve ticket details.');
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchTicket(isMounted);
    return () => {
      isMounted = false;
    };
  }, [ticketId, user?.email]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!customerReply.trim()) return;

    setIsSubmittingReply(true);
    try {
      const formattedNote = `Customer (${user?.name || 'Customer'}): ${customerReply.trim()}`;
      await ticketApi.updateTicket(ticket.ticket_id, {
        status: ticket.status,
        notes: formattedNote,
      });

      showToast('Reply posted to ticket thread.', 'success');
      setCustomerReply('');
      // Refresh ticket to show new note in timeline
      await fetchTicket(true);
    } catch (err) {
      showToast(err.message || 'Failed to post reply. Please try again.', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleMarkAsResolved = async () => {
    if (!window.confirm('Are you sure your issue is resolved? This will close your ticket.')) {
      return;
    }

    setIsClosingTicket(true);
    try {
      await ticketApi.updateTicket(ticket.ticket_id, {
        status: 'Closed',
        notes: `Customer (${user?.name || 'Customer'}) marked this ticket as resolved.`,
      });

      showToast('Ticket marked as resolved!', 'success');
      await fetchTicket(true);
    } catch (err) {
      showToast(err.message || 'Failed to update ticket status.', 'error');
    } finally {
      setIsClosingTicket(false);
    }
  };

  const handleRateCsat = (rating) => {
    setCsatRating(rating);
    try {
      localStorage.setItem(`csat_${ticketId}`, rating);
    } catch {
      // ignore
    }
    showToast(`Thank you! Support rating saved (${rating}/5 stars).`, 'success');
  };

  const getStepState = (targetStatus) => {
    const status = ticket?.status || 'Open';
    if (status === 'Closed') return 'completed';
    if (status === 'In Progress') {
      if (targetStatus === 'Open') return 'completed';
      if (targetStatus === 'In Progress') return 'current';
      return 'upcoming';
    }
    if (targetStatus === 'Open') return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex flex-col antialiased font-sans">
      <CustomerNavbar activeTab="tickets" onTabChange={() => navigate('/portal')} />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Back navigation & actions */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/portal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Tickets</span>
          </Link>

          {ticket && ticket.status !== 'Closed' && (
            <button
              type="button"
              disabled={isClosingTicket}
              onClick={handleMarkAsResolved}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isClosingTicket ? 'Closing...' : 'Mark as Resolved'}</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-7 h-7 border-2 border-slate-200 border-t-[#142a43] rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-xs text-slate-500 font-medium">Retrieving ticket status...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-white border border-rose-200 rounded-xl text-center shadow-xs">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Access Restricted</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">{error}</p>
            <Link
              to="/portal"
              className="mt-4 inline-block px-3.5 py-2 bg-[#142a43] text-white rounded-lg text-xs font-semibold hover:bg-[#203a58] transition-colors"
            >
              Return to Helpdesk
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {ticket.ticket_id}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {ticket.subject}
                  </h1>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Created on {formatDate(ticket.created_at)}</span>
                  </p>
                </div>
              </div>

              {/* Resolution Progress Bar */}
              <div className="pt-6">
                <span className="ops-label text-slate-500 block mb-4">
                  Resolution Progress
                </span>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  {/* Step 1: Received */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        getStepState('Open') === 'completed' || getStepState('Open') === 'current'
                          ? 'bg-[#142a43] text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      ✓
                    </div>
                    <span className="text-xs font-semibold text-slate-800 mt-2">Received</span>
                    <span className="text-[10px] text-slate-400">Logged in queue</span>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
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
                    <span className="text-[10px] text-slate-400">Agent investigating</span>
                  </div>

                  {/* Step 3: Resolved */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        ticket?.status === 'Closed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {ticket?.status === 'Closed' ? '✓' : '3'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 mt-2">Resolved</span>
                    <span className="text-[10px] text-slate-400">Case resolved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Issue Context */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div>
                <span className="ops-label text-slate-500 block mb-2">
                  Issue Summary & Context
                </span>
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200/80 font-sans">
                  {ticket.description}
                </p>
              </div>

              {/* Two-Way Conversation Timeline */}
              <div className="pt-4 border-t border-slate-100">
                <span className="ops-label text-slate-500 block mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Conversation & Support Timeline</span>
                </span>

                <div className="space-y-3 mb-5">
                  {ticket.notes && ticket.notes.length > 0 ? (
                    ticket.notes.map((note, idx) => {
                      const noteText = note.note_text || note.text || '';
                      const isCustomerNote = noteText.startsWith('Customer');

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-lg text-xs border ${
                            isCustomerNote
                              ? 'bg-cyan-50/70 border-cyan-200 ml-4'
                              : 'bg-slate-50 border-slate-200 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-1">
                            <span className="flex items-center gap-1.5">
                              {isCustomerNote ? (
                                <User className="w-3.5 h-3.5 text-cyan-700" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                              )}
                              <span className={isCustomerNote ? 'text-cyan-950' : 'text-slate-800'}>
                                {isCustomerNote ? 'You (Customer)' : 'Support Staff'}
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {formatDate(note.created_at || note.createdAt)}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed mt-1">
                            {noteText.replace(/^Customer \([^)]+\):\s*/, '')}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      No communications recorded yet. Our support agents will post updates here.
                    </div>
                  )}
                </div>

                {/* Two-Way Reply Input Form (If ticket is not closed) */}
                {ticket.status !== 'Closed' ? (
                  <form onSubmit={handleSendReply} className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Post a reply or provide additional details:
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        value={customerReply}
                        onChange={(e) => setCustomerReply(e.target.value)}
                        placeholder="Add extra context, transaction IDs, or follow-up questions..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#142a43] transition-colors resize-y"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingReply || !customerReply.trim()}
                        className="self-end px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#142a43] hover:bg-[#203a58] transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingReply ? 'Sending...' : 'Reply'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* CSAT 5-Star Customer Satisfaction Rating */
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center mt-4">
                    <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-xs mb-1">
                      <Check className="w-4 h-4" />
                      <span>This support ticket is marked as resolved.</span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3">
                      {csatRating
                        ? `Thank you for rating your support experience (${csatRating}/5 stars)!`
                        : 'How satisfied are you with the resolution of your issue?'}
                    </p>

                    {/* Star Rating Buttons */}
                    <div className="flex items-center justify-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRateCsat(star)}
                          className={`p-1.5 rounded-md transition-all ${
                            csatRating && star <= csatRating
                              ? 'text-amber-500 hover:scale-110'
                              : 'text-slate-300 hover:text-amber-400'
                          }`}
                          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Help desk reference footer */}
            <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-slate-400" />
                <span>Need immediate human assistance?</span>
              </span>
              <span className="font-semibold text-slate-800 font-mono text-[11px]">
                Support SLA: Mon–Fri, 9am–6pm
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerTicketView;
