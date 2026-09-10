import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { TICKET_STATUS_LIST } from '../../utils/constants';

const StatusFilter = ({ value = 'All Statuses', onChange }) => {
  const options = ['All Statuses', ...TICKET_STATUS_LIST];

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <label htmlFor="status-filter-select" className="sr-only">
        Filter tickets by status
      </label>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <select
          id="status-filter-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full sm:w-44 appearance-none pl-8 pr-8 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-md text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors cursor-pointer"
        >
          {options.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default StatusFilter;
