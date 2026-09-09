import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { calculateSlaStatus } from '../../utils/slaUtils';

const SlaBadge = ({ createdAt, status, compact = false, className = '' }) => {
  const sla = calculateSlaStatus(createdAt, status);

  if (sla.status === 'unknown') return null;

  if (sla.status === 'breached') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm ${className}`}
        title={`Target SLA breached! Immediate action required.`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="font-semibold">{compact ? sla.shortText : sla.text}</span>
      </span>
    );
  }

  if (sla.status === 'urgent') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}
        title="Approaching SLA deadline"
      >
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <span>{compact ? sla.shortText : sla.text}</span>
      </span>
    );
  }

  if (sla.status === 'met') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>{sla.text}</span>
      </span>
    );
  }

  if (sla.status === 'resolved_breached') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50 ${className}`}
      >
        <Clock className="w-3 h-3 text-zinc-500" />
        <span>{sla.text}</span>
      </span>
    );
  }

  // Healthy active
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800 ${className}`}
    >
      <Clock className="w-3 h-3 text-zinc-500" />
      <span>{compact ? sla.shortText : sla.text}</span>
    </span>
  );
};

export default SlaBadge;
