import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Button from '../components/common/Button';
import { validateTicketForm } from '../utils/validation';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    subject: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateTicketForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Prepare structure for backend submission
    setIsSubmitting(true);
    // UI prepared, not connected to backend yet per specification
    console.log('Ticket Form Submitted (Prepared):', formData);
    setIsSubmitting(false);
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
        title="Create New Ticket"
        description="Enter customer details and issue description to submit a new support ticket."
        action={backAction}
      />

      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="e.g. Jane Doe"
            required
            error={errors.customerName}
          />

          <Input
            label="Customer Email"
            name="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="e.g. jane.doe@example.com"
            required
            error={errors.customerEmail}
          />

          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief summary of the issue"
            required
            error={errors.subject}
          />

          <Textarea
            label="Description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide full details regarding the support request..."
            required
            error={errors.description}
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <Link to="/">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
