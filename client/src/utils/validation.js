/**
 * Basic email format validator.
 * 
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates the required fields for creating a support ticket:
 * - Customer Name
 * - Customer Email
 * - Subject
 * - Description
 * 
 * @param {Object} formData 
 * @returns {{ isValid: boolean, errors: Object }}
 */
export const validateTicketForm = (formData = {}) => {
  const errors = {};
  const { customerName, customerEmail, subject, description } = formData;

  if (!customerName || !customerName.trim()) {
    errors.customerName = 'Customer name is required';
  }

  if (!customerEmail || !customerEmail.trim()) {
    errors.customerEmail = 'Customer email is required';
  } else if (!isValidEmail(customerEmail)) {
    errors.customerEmail = 'Please enter a valid email address';
  }

  if (!subject || !subject.trim()) {
    errors.subject = 'Subject is required';
  }

  if (!description || !description.trim()) {
    errors.description = 'Description is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
