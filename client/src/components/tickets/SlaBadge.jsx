import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { calculateSlaStatus } from '../../utils/slaUtils';

const SlaBadge = ({ createdAt, status, compact = false, className = '' }) => {
  const sla = calculateSlaStatus(createdAt, status);

  if (sla.status === 'unknown') return null;

  if (sla.status === 'breached') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm ${className}`}
        title={`Target SLA breached! Immediate action required.`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span className="font-semibold">{compact ? sla.shortText : sla.text}</span>
      </span>
    );
  }

  if (sla.status === 'urgent') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
        title="Approaching SLA deadline"
      >
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>{compact ? sla.shortText : sla.text}</span>
      </span>
    );
  }

  if (sla.status === 'met') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>{sla.text}</span>
      </span>
    );
  }

  if (sla.status === 'resolved_breached') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
      >
        <Clock className="w-3 h-3 text-slate-500" />
        <span>{sla.text}</span>
      </span>
    );
  }

  // Healthy active
  return (
    <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
    >
      <Clock className="w-3 h-3 text-slate-500" />
      <span>{compact ? sla.shortText : sla.text}</span>
    </span>
  );
};

export default SlaBadge;
