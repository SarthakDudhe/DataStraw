import React from 'react';
import { TICKET_STATUS_LIST } from '../../utils/constants';

const StatusFilter = ({ value = 'All Statuses', onChange }) => {
  const options = ['All Statuses', ...TICKET_STATUS_LIST];

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <label htmlFor="status-filter-select" className="sr-only">
        Filter tickets by status
      </label>
      <select
        id="status-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-44 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm cursor-pointer"
      >
        {options.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusFilter;
