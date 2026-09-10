import React from 'react';
import { TICKET_STATUS } from '../../utils/constants';

const statusStyles = {
  [TICKET_STATUS.OPEN]: {
    container: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dot: 'bg-cyan-600',
  },
  [TICKET_STATUS.IN_PROGRESS]: {
    container: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-600',
  },
  [TICKET_STATUS.CLOSED]: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
  },
};

const StatusBadge = ({ status, className = '' }) => {
  const current = statusStyles[status] || {
    container: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide select-none ${current.container} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <span>{status || 'Unknown'}</span>
    </span>
  );
};

export default StatusBadge;
