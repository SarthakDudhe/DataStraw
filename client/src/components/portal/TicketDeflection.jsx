import React, { useMemo } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ExternalLink, HelpCircle } from 'lucide-react';

const DEFLECTION_CATALOG = [
  {
    id: 'payment',
    keywords: ['pay', 'card', 'checkout', 'decline', 'charge', 'bill', 'otp', '3ds', 'transaction', 'bank'],
    title: 'Instant Fix: Payment Failure & Card Verification',
    badge: 'Billing & Checkout',
    steps: [
      'Ensure international / online e-commerce transactions are enabled in your mobile banking app.',
      'If 3D-Secure OTP was not received, check that SMS shortcodes are allowed by your carrier.',
      'If money was deducted during a failed checkout, uncaptured bank holds reverse automatically within 24–48 hours.',
    ],
    quickTip: 'Tip: 90% of checkout declines are resolved by toggling international usage in your bank portal.',
  },
  {
    id: 'auth',
    keywords: ['password', 'login', '2fa', 'auth', 'lock', 'reset', 'sign in', 'token', 'access', 'credential'],
    title: 'Instant Fix: Account Access & 2FA Synchronization',
    badge: 'Access & Security',
    steps: [
      'Open a private/incognito window or clear browser cache to remove stale session cookies.',
      'If 2FA codes are failing, open your Authenticator app and tap "Time sync / Sync clocks now".',
      'Use the self-service "Reset Password" link to trigger a fresh secure magic link (valid for 15 mins).',
    ],
    quickTip: 'Tip: Authenticator time drift is the most common cause of invalid 2FA codes.',
  },
  {
    id: 'refund',
    keywords: ['refund', 'cancel', 'subscription', 'downgrade', 'money back', 'receipt', 'invoice'],
    title: 'Instant Guide: Self-Service Refund & Plan Cancellation',
    badge: 'Billing Policy',
    steps: [
      'You can instantly pause or cancel your subscription anytime under Settings → Billing.',
      'Eligible refunds within 14 days of renewal are processed to your original payment method in 3–5 business days.',
      'VAT invoices and tax receipts are automatically downloadable from your Billing receipt history.',
    ],
    quickTip: 'Tip: You can download previous invoices directly from your customer dashboard.',
  },
  {
    id: 'api',
    keywords: ['api', 'webhook', '401', '429', 'rate limit', 'endpoint', 'timeout', '500', 'payload', 'cors'],
    title: 'Developer Fix: API Rate Limits & Webhook Verification',
    badge: 'Developer & API',
    steps: [
      'Check that your API key is prefixed with `Bearer ` in the Authorization header.',
      'HTTP 429 means you hit the 100 req/min rate limit — configure exponential backoff in your client.',
      'Verify endpoint SSL certificates and ensure your server replies with HTTP 200 within 5 seconds for webhooks.',
    ],
    quickTip: 'Tip: Check status.datastraw.io for real-time API uptime metrics.',
  },
];

export const TicketDeflection = ({ query = '', onDeflected, onDismiss }) => {
  const normalizedQuery = query.toLowerCase();

  // Match against deflection rules
  const matchedSolution = useMemo(() => {
    if (!normalizedQuery || normalizedQuery.length < 4) return null;

    for (const item of DEFLECTION_CATALOG) {
      const match = item.keywords.some((kw) => normalizedQuery.includes(kw));
      if (match) {
        return item;
      }
    }
    return null;
  }, [normalizedQuery]);

  if (!matchedSolution) return null;

  return (
    <div className="my-4 p-4 rounded-xl bg-cyan-50/80 border border-cyan-200 text-slate-900 shadow-xs animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-700 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-800 bg-white px-2 py-0.5 rounded border border-cyan-200">
                {matchedSolution.badge}
              </span>
              <span className="text-[11px] font-semibold text-cyan-900">
                Suggested Instant Fix
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
              {matchedSolution.title}
            </h4>
          </div>
        </div>
      </div>

      {/* Suggested steps */}
      <ul className="mt-2.5 space-y-1.5 pl-2 text-xs text-slate-700">
        {matchedSolution.steps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-cyan-700 font-bold shrink-0 text-xs">
              {idx + 1}.
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ul>

      {/* Quick Tip */}
      <div className="mt-3 text-[11px] text-cyan-900 bg-white/70 p-2 rounded-lg border border-cyan-100 flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
        <span>{matchedSolution.quickTip}</span>
      </div>

      {/* Action choices: Deflection vs Continue */}
      <div className="mt-3 pt-3 border-t border-cyan-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-[11px] text-slate-500">
          Did this resolve your question without waiting for support?
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDeflected(matchedSolution.title)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>This Solved My Issue!</span>
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              No, submit ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDeflection;
