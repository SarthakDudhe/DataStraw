import React from 'react';
import { TICKET_STATUS } from '../../utils/constants';

const statusStyles = {
  [TICKET_STATUS.OPEN]: 'bg-blue-50 text-blue-700 border-blue-200',
  [TICKET_STATUS.IN_PROGRESS]: 'bg-amber-50 text-amber-700 border-amber-200',
  [TICKET_STATUS.CLOSED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const StatusBadge = ({ status, className = '' }) => {
  const currentStyle = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
