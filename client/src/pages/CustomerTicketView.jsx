import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';
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
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex flex-col antialiased font-sans">
      <CustomerNavbar activeTab="tickets" onTabChange={() => navigate('/portal')} />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/portal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Tickets</span>
          </Link>
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

            {/* Description & Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div>
                <span className="ops-label text-slate-500 block mb-2">
                  Issue Summary & Context
                </span>
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200/80 font-sans">
                  {ticket.description}
                </p>
              </div>

              {/* Notes / Activity Feed for Customer */}
              {ticket.notes && ticket.notes.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="ops-label text-slate-500 block mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>Support Communications</span>
                  </span>
                  <div className="space-y-2.5">
                    {ticket.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-800 font-semibold mb-1">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
                            <span>Support Staff</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {formatDate(note.created_at || note.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-1 leading-relaxed">{note.note_text || note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help desk reference footer */}
            <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-slate-400" />
                <span>Need to provide supplemental logs or details?</span>
              </span>
              <span className="font-semibold text-slate-800 font-mono text-[11px]">
                Reply referencing #{ticket.ticket_id}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerTicketView;
