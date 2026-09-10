import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import { createTicket } from '../services/ticketApi';
import { validateTicketForm } from '../utils/validation';
import { useToast } from '../components/common/Toast';
import PageHeader from '../components/common/PageHeader';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import LiveTriageCard from '../components/tickets/LiveTriageCard';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    subject: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validation = validateTicketForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createTicket({
        customer_name: formData.customerName.trim(),
        customer_email: formData.customerEmail.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      });

      const ticketId = response.ticket_id || response.id || response.ticketId;
      showToast(`Ticket ${ticketId ? `#${ticketId}` : ''} created successfully.`, 'success');

      if (ticketId) {
        navigate(`/tickets/${ticketId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.message || 'Unable to create ticket. Please check your information and try again.';
      setSubmitError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const backAction = (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back to Tickets</span>
    </Link>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Start a conversation"
        description="Capture clear context so the right person can take the next step quickly."
        action={backAction}
      />

      <div className="ops-panel p-6 sm:p-8">
        {submitError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-md bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{submitError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              helperText="Full name of the requesting customer"
              required
              error={errors.customerName}
              disabled={isSubmitting}
            />

            <Input
              label="Customer Email"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="e.g. rahul@example.com"
              helperText="Used for customer communication"
              required
              error={errors.customerEmail}
              disabled={isSubmitting}
            />
          </div>

          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief summary of the issue"
            helperText="Clear and concise summary of the problem"
            required
            error={errors.subject}
            disabled={isSubmitting}
          />

          <Textarea
            label="Description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide complete details regarding the support request..."
            helperText="Include error messages, reproduction steps, or relevant context"
            required
            error={errors.description}
            disabled={isSubmitting}
          />

          {/* Real-time Triage & SLA Prediction */}
          <LiveTriageCard
            subject={formData.subject}
            description={formData.description}
          />

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end gap-3">
            <Link to="/">
              <Button variant="ghost" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Create Ticket</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
