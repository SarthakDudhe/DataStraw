/**
 * AI Copilot Engine for Support CRM
 * Generates context-aware summaries, sentiment analysis, and professional response drafts
 * based on the ticket's subject, description, and customer details.
 */

export const generateTicketSummary = (ticket) => {
  const subject = ticket?.subject || 'Support request';
  const description = ticket?.description || '';
  const descLower = description.toLowerCase();

  // Sentiment detection heuristic
  let sentiment = 'Neutral';
  let sentimentColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';

  if (
    descLower.includes('fail') || 
    descLower.includes('error') || 
    descLower.includes('urgent') || 
    descLower.includes('broken') ||
    descLower.includes('cannot')
  ) {
    sentiment = 'High Priority / Frustrated';
    sentimentColor = 'text-red-400 bg-red-500/10 border-red-500/20';
  } else if (descLower.includes('request') || descLower.includes('feature') || descLower.includes('csv')) {
    sentiment = 'Constructive / Feature Request';
    sentimentColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  }

  // Generate core problem synthesis
  let coreProblem = `Customer encountered an issue with: ${subject}.`;
  if (descLower.includes('payment') || descLower.includes('checkout')) {
    coreProblem = 'Payment transaction failure during checkout. Gateway communication error or card decline.';
  } else if (descLower.includes('password') || descLower.includes('login')) {
    coreProblem = 'Authentication blocker: User is unable to log in or token expired unexpectedly.';
  } else if (descLower.includes('export') || descLower.includes('csv')) {
    coreProblem = 'User requested enhanced data reporting and CSV export capabilities.';
  }

  // Recommended next step
  let nextStep = 'Verify customer account logs and initiate troubleshooting.';
  if (descLower.includes('payment')) {
    nextStep = 'Inspect payment gateway logs for failure status codes and verify transaction token.';
  } else if (descLower.includes('password') || descLower.includes('token')) {
    nextStep = 'Regenerate secure password reset link and verify customer email delivery.';
  } else if (descLower.includes('export') || descLower.includes('feature')) {
    nextStep = 'Log feature ticket in product backlog and inform customer of planned roadmap status.';
  }

  return {
    sentiment,
    sentimentColor,
    coreProblem,
    nextStep,
    timeSaved: '2.5 mins saved',
  };
};

export const generateSmartReply = (ticket, replyType = 'investigating', tone = 'professional') => {
  const customerName = ticket?.customer_name || ticket?.customerName || 'there';
  const firstName = customerName.split(' ')[0];
  const subject = ticket?.subject || 'your request';

  const templates = {
    investigating: {
      professional: `Hi ${firstName},\n\nThank you for reaching out to Support regarding "${subject}".\n\nI have reviewed your request and am currently investigating the underlying cause with our technical team. I will provide you with an update as soon as we make progress or have a resolution ready.\n\nBest regards,\nCustomer Support Team`,
      empathetic: `Hi ${firstName},\n\nI completely understand how frustrating it is to deal with "${subject}". Please rest assured that we are taking this seriously.\n\nOur engineering team is already actively looking into this, and I will personally follow up with you as soon as we have an update.\n\nWarm regards,\nCustomer Support Team`,
      concise: `Hi ${firstName},\n\nWe have received your ticket regarding "${subject}". Our team is actively investigating and will follow up shortly with next steps.\n\nThanks,\nSupport Team`,
    },
    resolved: {
      professional: `Hi ${firstName},\n\nWe are pleased to inform you that the issue regarding "${subject}" has been identified and resolved.\n\nPlease try again and let us know if you encounter any further difficulties. Thank you for your patience while we resolved this for you.\n\nBest regards,\nCustomer Support Team`,
      empathetic: `Hi ${firstName},\n\nGreat news! We have successfully deployed a fix for the issue you reported with "${subject}".\n\nWe truly appreciate your patience while we worked through this. Please verify everything is working smoothly on your end.\n\nBest regards,\nCustomer Support Team`,
      concise: `Hi ${firstName},\n\nThe issue regarding "${subject}" is now resolved. Please test on your end and let us know if you need anything else.\n\nThanks,\nSupport Team`,
    },
    need_info: {
      professional: `Hi ${firstName},\n\nThank you for contacting support. To help us diagnose and resolve "${subject}" as quickly as possible, could you please provide a few additional details?\n\n1. What browser or device were you using when the issue occurred?\n2. Any specific error code or screenshot displayed?\n\nOnce we receive these details, we will proceed immediately with troubleshooting.\n\nBest regards,\nCustomer Support Team`,
      empathetic: `Hi ${firstName},\n\nWe want to get "${subject}" resolved for you as quickly as possible! Could you share a quick screenshot or let us know the exact error message you saw?\n\nThis will help us pinpoint the root cause right away.\n\nWarm regards,\nCustomer Support Team`,
      concise: `Hi ${firstName},\n\nCould you please share a screenshot or the exact error code seen regarding "${subject}" so we can troubleshoot further?\n\nThanks,\nSupport Team`,
    },
  };

  const selectedType = templates[replyType] || templates.investigating;
  return selectedType[tone] || selectedType.professional;
};
