import React from 'react';
import { TICKET_STATUS } from '../../utils/constants';

const statusStyles = {
  [TICKET_STATUS.OPEN]: {
    container: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  [TICKET_STATUS.IN_PROGRESS]: {
    container: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  [TICKET_STATUS.CLOSED]: {
    container: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
};

const StatusBadge = ({ status, className = '' }) => {
  const current = statusStyles[status] || {
    container: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40',
    dot: 'bg-zinc-500',
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
