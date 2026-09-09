import React from 'react';
import { TICKET_STATUS_LIST } from '../../utils/constants';

const StatusFilter = ({ value = 'All', onChange }) => {
  const options = ['All', ...TICKET_STATUS_LIST];

  return (
    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md border border-slate-200">
      {options.map((status) => {
        const isSelected = value === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              isSelected
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
};

export default StatusFilter;
