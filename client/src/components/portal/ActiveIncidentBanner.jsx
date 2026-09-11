import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, Bell } from 'lucide-react';

export const ActiveIncidentBanner = () => {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-950 p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                Active Advisory
              </span>
              <span className="text-xs font-bold text-amber-950">
                Payment Gateway & Webhook Processing Delays
              </span>
              <span className="text-[10px] text-amber-800 font-mono">
                Updated 12m ago
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              We are actively monitoring intermittent latency with our upstream payment processor. Checkout confirmations may experience 2–5 minute delays.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 rounded-md transition-colors"
          >
            <span>{expanded ? 'Hide Details' : 'Details'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded technical details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-amber-200/80 text-xs text-amber-900 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-white/60 border border-amber-200">
            <div>
              <span className="font-semibold text-amber-950 block">Impacted Services:</span>
              <span className="text-amber-800">Checkout API, Stripe Webhooks, Invoicing</span>
            </div>
            <div>
              <span className="font-semibold text-amber-950 block">Current Status:</span>
              <span className="text-amber-800">Monitoring upstream fix deployment</span>
            </div>
          </div>
          <p className="text-[11px] text-amber-800 italic">
            * Note: If you are experiencing checkout delays, please refrain from multiple card retries to avoid temporary bank authorizations.
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveIncidentBanner;
