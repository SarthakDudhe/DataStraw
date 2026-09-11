import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Inbox, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  RotateCw,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import StatusBadge from '../components/tickets/StatusBadge';
import TicketDeflection from '../components/portal/TicketDeflection';
import ActiveIncidentBanner from '../components/portal/ActiveIncidentBanner';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../services/ticketApi';
import { formatDate } from '../utils/formatDate';
import { useToast } from '../components/common/Toast';

const FAQ_ITEMS = [
  {
    q: 'How long does it take for the support team to respond?',
    a: 'Our support team responds to new tickets within 2–4 hours during operational hours. Critical issues are prioritized immediately based on impact scoring.',
  },
  {
    q: 'How will I receive updates on my ticket?',
    a: 'Updates and status changes are reflected live in this portal under "My Tickets". You will also receive notification emails as agents resolve your case.',
  },
  {
    q: 'Can I add extra information after submitting a ticket?',
    a: 'Yes! You can view any open ticket from your list and follow up with additional context as our support team investigates.',
  },
  {
    q: 'What should I do if my payment failed?',
    a: 'Check that your bank allows international or online transactions, or try an alternate payment method. If your account was debited, include the transaction reference in your ticket.',
  },
];

const CustomerPortal = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'tickets' | 'faq'
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [deflectedSolution, setDeflectedSolution] = useState(null);

  // Tickets state
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState('');

  // Fetch customer's own tickets
  const fetchMyTickets = useCallback(async () => {
    if (!user?.email) return;
    setLoadingTickets(true);
    setTicketsError('');
    try {
      const allTickets = await ticketApi.getTickets();
      const list = Array.isArray(allTickets) ? allTickets : [];
      // Filter strictly by customer's email
      const filtered = list.filter(
        (t) => (t.customer_email || '').toLowerCase() === user.email.toLowerCase()
      );
      setMyTickets(filtered);
    } catch (err) {
      setTicketsError(err.message || 'Unable to load your tickets.');
    } finally {
      setLoadingTickets(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchMyTickets();
    }
  }, [activeTab, fetchMyTickets]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDeflection = (solutionTitle) => {
    setDeflectedSolution(solutionTitle);
    setFormData({ subject: '', description: '' });
    showToast('Inquiry resolved instantly! Ticket deflected.', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = 'Issue subject is required';
    if (!formData.description.trim()) newErrors.description = 'Please provide details about your issue';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: user?.name || 'Rahul Sharma',
        customer_email: user?.email || 'customer@example.com',
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      };

      const result = await ticketApi.createTicket(payload);
      setSubmittedTicket(result);
      setFormData({ subject: '', description: '' });
      showToast(`Support ticket ${result.ticket_id} created successfully!`, 'success');
      fetchMyTickets();
    } catch (err) {
      showToast(err.message || 'Failed to submit ticket. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex flex-col antialiased font-sans">
      <CustomerNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Active Incident Warning Banner */}
        <ActiveIncidentBanner />

        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="ops-label text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 inline-block mb-1.5">
                Customer Help Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                How can we help, {user?.name?.split(' ')[0] || 'there'}?
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Submit a new inquiry, track live resolution status, or search common solutions.
              </p>
            </div>

            {/* Quick action controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedTicket(null);
                  setDeflectedSolution(null);
                  setActiveTab('submit');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs ${
                  activeTab === 'submit'
                    ? 'bg-[#142a43] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Request</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs ${
                  activeTab === 'tickets'
                    ? 'bg-[#142a43] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>My Tickets ({myTickets.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: SUBMIT A TICKET */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto">
            {/* DEFLECTED CELEBRATION CARD */}
            {deflectedSolution ? (
              <div className="bg-white border border-emerald-200 rounded-xl p-8 shadow-sm text-center animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <Check className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  Ticket Deflected & Self-Resolved
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-3">
                  Glad we could solve your issue instantly!
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  You self-resolved via <span className="font-semibold text-slate-800">"{deflectedSolution}"</span>. No support ticket was logged, saving you queue wait time.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDeflectedSolution(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#142a43] text-white hover:bg-[#203a58] transition-colors shadow-sm"
                  >
                    Ask Another Question
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('faq')}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Browse Knowledge Base
                  </button>
                </div>
              </div>
            ) : submittedTicket ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  {submittedTicket.ticket_id}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-3">
                  Ticket Logged Successfully
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Our customer operations team has received your ticket. Updates will be sent to{' '}
                  <span className="font-semibold text-slate-800">{user?.email}</span>.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <Link
                    to={`/portal/tickets/${submittedTicket.ticket_id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#142a43] text-white hover:bg-[#203a58] transition-colors shadow-sm"
                  >
                    <span>View Resolution Progress</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Submit Support Request
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please provide detailed information so our team can resolve your inquiry efficiently.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Pre-filled identity preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="ops-label text-slate-500 block">Customer Name</span>
                      <span className="font-semibold text-slate-800 block mt-1">
                        {user?.name || 'Rahul Sharma'}
                      </span>
                    </div>
                    <div>
                      <span className="ops-label text-slate-500 block">Contact Email</span>
                      <span className="font-semibold text-slate-800 block mt-1 font-mono">
                        {user?.email || 'customer@example.com'}
                      </span>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Subject / Brief Summary <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleFormChange}
                      placeholder="e.g. Payment transaction failed during checkout"
                      className={`w-full px-3.5 py-2 bg-white border rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#142a43] transition-colors ${
                        errors.subject ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-xs text-rose-600">{errors.subject}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Detailed Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Describe what occurred, steps to reproduce, or relevant account details..."
                      className={`w-full px-3.5 py-2 bg-white border rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#142a43] transition-colors resize-y ${
                        errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Real-time ticket deflection engine (As user types) */}
                  <TicketDeflection
                    query={`${formData.subject} ${formData.description}`}
                    onDeflected={handleDeflection}
                  />

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ subject: '', description: '' })}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#142a43] hover:bg-[#203a58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Ticket</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">My Support Tickets</h2>
                <p className="text-xs text-slate-500">
                  Requests associated with {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={fetchMyTickets}
                disabled={loadingTickets}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingTickets ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingTickets ? (
              <div className="py-16 text-center">
                <div className="w-7 h-7 border-2 border-slate-200 border-t-[#142a43] rounded-full animate-spin mx-auto" />
                <p className="mt-3 text-xs text-slate-500 font-medium">Loading your tickets...</p>
              </div>
            ) : ticketsError ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <p className="text-xs text-rose-800">{ticketsError}</p>
                <button
                  type="button"
                  onClick={fetchMyTickets}
                  className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">No active tickets</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You have not submitted any support tickets under this email yet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className="mt-4 px-3.5 py-2 bg-[#142a43] text-white rounded-lg text-xs font-semibold hover:bg-[#203a58] transition-colors"
                >
                  Create First Ticket
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {myTickets.map((ticket) => (
                    <div
                      key={ticket.ticket_id}
                      className="p-4 sm:p-5 hover:bg-slate-50/75 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {ticket.ticket_id}
                          </span>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <Link
                          to={`/portal/tickets/${ticket.ticket_id}`}
                          className="text-sm font-semibold text-slate-900 hover:text-cyan-800 transition-colors block truncate"
                        >
                          {ticket.subject}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {ticket.description}
                        </p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>Submitted on {formatDate(ticket.created_at)}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link
                          to={`/portal/tickets/${ticket.ticket_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 transition-colors"
                        >
                          <span>Track</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FAQ & KNOWLEDGE BASE */}
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="text-center mb-6">
              <span className="ops-label text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 inline-block mb-1.5">
                Self-Service Library
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Frequently Answered Inquiries
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Immediate answers for common billing, platform, and operational questions.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs"
                >
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 flex items-start gap-2">
                    <span className="text-cyan-700 font-mono font-bold">Q.</span>
                    <span>{item.q}</span>
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-5">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-xl bg-slate-100/70 border border-slate-200 text-center mt-6">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-800">
                Still have unanswered questions?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Our support desk is operational and ready to triage your request.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#142a43] text-white hover:bg-[#203a58] transition-colors shadow-sm"
              >
                <span>Open Support Ticket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerPortal;
