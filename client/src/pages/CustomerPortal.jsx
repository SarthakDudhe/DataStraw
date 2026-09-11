import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CustomerNavbar from '../components/layout/CustomerNavbar';
import StatusBadge from '../components/tickets/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../services/ticketApi';
import { formatDate } from '../utils/formatDate';
import { useToast } from '../components/common/Toast';

const FAQ_ITEMS = [
  {
    q: 'How long does it take for the support team to respond?',
    a: 'Our support team typically responds to all new tickets within 2–4 hours during business days. Critical issues are prioritized immediately.',
  },
  {
    q: 'How will I receive updates on my ticket?',
    a: 'Updates and status changes are reflected live in this portal under "My Tickets". You will also receive email notifications for major updates.',
  },
  {
    q: 'Can I add extra information after submitting a ticket?',
    a: 'Yes! You can view any open ticket from your list and follow up with additional context as our support team investigates.',
  },
  {
    q: 'What should I do if my payment failed?',
    a: 'Check that your bank allows international transactions, or try an alternate payment method. If the charge was debited, provide the transaction reference ID in your ticket.',
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
        customer_name: user?.name || 'Valued Customer',
        customer_email: user?.email || 'customer@example.com',
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      };

      const result = await ticketApi.createTicket(payload);
      setSubmittedTicket(result);
      setFormData({ subject: '', description: '' });
      showToast(`Support ticket ${result.ticket_id} created successfully!`, 'success');
      // refresh my tickets in background
      fetchMyTickets();
    } catch (err) {
      showToast(err.message || 'Failed to submit ticket. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <CustomerNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 font-mono">
                Customer Support Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                How can we help you, {user?.name?.split(' ')[0] || 'there'}?
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Submit an issue, track your active requests, or browse self-service guides.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedTicket(null);
                  setActiveTab('submit');
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-xs ${
                  activeTab === 'submit'
                    ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                + New Request
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-xs ${
                  activeTab === 'tickets'
                    ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                My Tickets ({myTickets.length})
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: SUBMIT A TICKET */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto">
            {submittedTicket ? (
              <div className="bg-white border border-emerald-200 rounded-2xl p-8 shadow-sm text-center animate-fadeIn">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {submittedTicket.ticket_id}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-3">
                  Ticket Submitted Successfully!
                </h2>
                <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                  Our customer support team has received your ticket and is reviewing it. We will reach out to{' '}
                  <span className="font-semibold text-slate-800">{user?.email}</span>.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <Link
                    to={`/portal/tickets/${submittedTicket.ticket_id}`}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-all"
                  >
                    View Ticket Status &rarr;
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Submit a Support Request
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please provide full details so our team can resolve your inquiry as quickly as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Pre-filled identity preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block">
                        Customer Name
                      </span>
                      <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                        {user?.name || 'Rahul Sharma'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block">
                        Customer Email
                      </span>
                      <span className="text-sm font-semibold text-slate-800 block mt-0.5 font-mono">
                        {user?.email || 'customer@example.com'}
                      </span>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Subject / Issue Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleFormChange}
                      placeholder="e.g. Payment failed during checkout"
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        errors.subject ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-xs text-red-600">{errors.subject}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Issue Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Explain what happened, steps to reproduce, or any relevant details..."
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y ${
                        errors.description ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ subject: '', description: '' })}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <span>Submit Ticket &rarr;</span>
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
                <h2 className="text-lg font-bold text-slate-900">My Support Tickets</h2>
                <p className="text-xs text-slate-500">
                  Track progress and read communication for requests linked to {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={fetchMyTickets}
                disabled={loadingTickets}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {loadingTickets ? 'Refreshing...' : '↻ Refresh'}
              </button>
            </div>

            {loadingTickets ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                <p className="mt-3 text-xs text-slate-500 font-medium">Loading your tickets...</p>
              </div>
            ) : ticketsError ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-sm text-red-700">{ticketsError}</p>
                <button
                  type="button"
                  onClick={fetchMyTickets}
                  className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900">No tickets found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You have not submitted any support tickets under this email yet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-colors"
                >
                  Create Your First Ticket
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {myTickets.map((ticket) => (
                    <div
                      key={ticket.ticket_id}
                      className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {ticket.ticket_id}
                          </span>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <Link
                          to={`/portal/tickets/${ticket.ticket_id}`}
                          className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {ticket.subject}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {ticket.description}
                        </p>
                        <div className="text-[11px] text-slate-400">
                          Submitted on {formatDate(ticket.created_at)}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link
                          to={`/portal/tickets/${ticket.ticket_id}`}
                          className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          View Status &rarr;
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
              <h2 className="text-xl font-bold text-slate-900">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Quick answers to common questions regarding support requests and accounts.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs"
                >
                  <h3 className="text-sm font-semibold text-slate-900 flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">Q.</span>
                    <span>{item.q}</span>
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-5">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 text-center mt-6">
              <h4 className="text-sm font-semibold text-indigo-900">
                Can't find what you're looking for?
              </h4>
              <p className="text-xs text-indigo-700 mt-1">
                Our support agents are always ready to assist you directly.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
              >
                Open a Support Ticket
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerPortal;
