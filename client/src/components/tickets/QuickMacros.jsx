import React, { useState } from 'react';
import { Zap, ChevronDown, Check } from 'lucide-react';

const MACROS = [
  {
    id: 'ack',
    title: 'Acknowledgment',
    description: 'Confirm ticket received & under investigation',
    template: (t) =>
      `Hi ${t.customerName || 'there'},\n\nThank you for reaching out to our support team. We have received your request regarding "${t.subject}" (Ticket #${t.id}) and our engineering team is actively investigating the issue.\n\nWe will update you here as soon as we have more details or need any additional information.\n\nBest regards,\nSupport Engineering`,
  },
  {
    id: 'request_info',
    title: 'Request Diagnostic Info',
    description: 'Ask for reproduction steps and logs',
    template: (t) =>
      `Hi ${t.customerName || 'there'},\n\nTo help us diagnose and reproduce the issue effectively, could you please provide us with:\n1. The exact steps to reproduce the issue\n2. Any error codes or screenshots you encountered\n3. Your current browser, version, and device OS\n\nOnce received, we will proceed immediately with troubleshooting.\n\nBest regards,\nSupport Engineering`,
  },
  {
    id: 'resolved',
    title: 'Resolution Deployed',
    description: 'Notify customer that fix is live and ask to confirm',
    template: (t) =>
      `Hi ${t.customerName || 'there'},\n\nWe have deployed a fix addressing the issue reported in "${t.subject}".\n\nCould you please test this on your end and verify if everything is working as expected now? If you continue to see any errors, feel free to reply directly to this ticket.\n\nThank you for your patience!`,
  },
  {
    id: 'billing',
    title: 'Billing Inquiry Update',
    description: 'Invoice and refund adjustment confirmation',
    template: (t) =>
      `Hi ${t.customerName || 'there'},\n\nThank you for contacting billing support regarding ticket #${t.id}.\n\nWe have reviewed your account and initiated the requested adjustment. This typically reflects on your original payment method within 3 to 5 business days.\n\nPlease don't hesitate to reach out if you have any questions in the meantime.`,
  },
];

const QuickMacros = ({ ticket, onApplyMacro, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedId, setAppliedId] = useState(null);

  const customerName = ticket?.customer_name || ticket?.customerName || '';
  const subject = ticket?.subject || '';
  const id = ticket?.ticket_id || ticket?.id || '';

  const handleSelectMacro = (macro) => {
    const text = macro.template({
      customerName,
      subject,
      id,
    });

    onApplyMacro(text);
    setAppliedId(macro.id);
    setIsOpen(false);

    setTimeout(() => {
      setAppliedId(null);
    }, 2500);
  };

  return (
    <div className="relative inline-block text-left w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Response / Note
        </label>
        
        {/* Macros trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
        >
          <Zap className="w-3 h-3 text-amber-700" />
          <span>Response templates</span>
          <ChevronDown className="w-3 h-3 text-amber-700" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-7 z-30 w-72 sm:w-80 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
            Insert Saved Macro
          </div>
          {MACROS.map((macro) => (
            <button
              key={macro.id}
              type="button"
              onClick={() => handleSelectMacro(macro)}
              className="w-full text-left p-2 rounded-md hover:bg-slate-50 transition-colors group flex items-start justify-between gap-2"
            >
              <div>
                <div className="text-xs font-semibold text-slate-700 group-hover:text-amber-800 transition-colors">
                  {macro.title}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">
                  {macro.description}
                </div>
              </div>
              {appliedId === macro.id && (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickMacros;
