import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket } from '../services/ticketApi';
import { validateTicketForm } from '../utils/validation';
import { useToast } from '../components/common/Toast';
import PageHeader from '../components/common/PageHeader';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';

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

    // Clear error for field as user types
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

    // Step 1: Validate Form
    const validation = validateTicketForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Step 2 & 3: Disable button and show loading state
    setIsSubmitting(true);

    try {
      // Step 4: Send POST request
      const response = await createTicket({
        customer_name: formData.customerName.trim(),
        customer_email: formData.customerEmail.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      });

      const ticketId = response.ticket_id || response.id || response.ticketId;

      // Step 5: Handle success with toast
      showToast(`Ticket ${ticketId ? `#${ticketId}` : ''} created successfully.`, 'success');

      // Step 7: Navigate to the newly created ticket
      if (ticketId) {
        navigate(`/tickets/${ticketId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      // Step 6: Handle failure without clearing the form
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
      className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
    >
      &larr; Back to Tickets
    </Link>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Create Support Ticket"
        description="Create a new customer support request."
        action={backAction}
      />

      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        {submitError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700"
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
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
            required
            error={errors.customerEmail}
            disabled={isSubmitting}
          />

          <Input
            label="Issue Title"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g. Payment failed during checkout"
            required
            error={errors.subject}
            disabled={isSubmitting}
          />

          <Textarea
            label="Issue Description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the customer issue..."
            required
            error={errors.description}
            disabled={isSubmitting}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
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
              {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
